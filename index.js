import { randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * GitHub publish desk for local profile plugins.
 *
 * A catalog cannot host code: 1024store indexes GitHub repositories that carry
 * the `dsh-plugin` topic (and that keep `dsh.bundle.patch` + the patch file in
 * the default branch). This Host half turns a local plugin directory into such
 * a repository: init, commit, create the public repo, push, and set topics.
 *
 * The GitHub token stays in DSH credentials; it reaches GitHub API calls and a
 * per-command git auth header, never the browser and never .git/config.
 */

const TOKEN_REF = 'DSH_GITHUB_PUBLISH_TOKEN'
const API = 'https://api.github.com'
const TOPIC = 'dsh-plugin'
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/
const MAX_OUTPUT = 400000

const jobs = new Map()
const JOB_TTL = 15 * 60 * 1000

function pruneJobs() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (now - job.startedAt > JOB_TTL) jobs.delete(id)
  }
}

function profileDirOf(ctx) {
  const envDir = process.env.DSH_PROFILE_DIR
  if (envDir) return envDir
  const manager = ctx.get('pluginManager')
  const dir = manager?.profile?.dir
  return typeof dir === 'string' ? dir : undefined
}

function fail(code, message, details) {
  return { ok: false, error: { code, message, details: details ?? {} } }
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return undefined
  }
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function repositoryOf(manifest) {
  const repo = manifest?.repository
  if (typeof repo === 'string') return repo
  if (repo && typeof repo === 'object' && nonEmpty(repo.url)) return String(repo.url)
  return ''
}

function inspectPlugin(dir) {
  const manifest = readJson(join(dir, 'package.json'))
  if (!manifest || typeof manifest !== 'object') return undefined
  const patchRel = manifest?.dsh?.bundle?.patch
  const patchPath = nonEmpty(patchRel) ? resolve(dir, patchRel) : undefined
  const license = nonEmpty(manifest.license) ? String(manifest.license) : ''
  const licenseFile = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license'].find((name) =>
    existsSync(join(dir, name)),
  )
  const readmeFile = ['README.md', 'readme.md', 'README.zh.md', 'README', 'readme'].find((name) =>
    existsSync(join(dir, name)),
  )
  return {
    name: String(manifest.name || ''),
    version: String(manifest.version || ''),
    description: String(manifest.description || ''),
    license,
    licenseFile: licenseFile || '',
    readmeFile: readmeFile || '',
    repository: repositoryOf(manifest),
    hasPatch: Boolean(patchPath && existsSync(patchPath)),
    patchPath: patchPath || '',
  }
}

function dependencySpecs(manifest) {
  const out = []
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    const deps = manifest?.[section]
    if (!deps || typeof deps !== 'object') continue
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec === 'string') out.push([name, spec])
    }
  }
  return out
}

function repoSlugOf(dir) {
  try {
    const text = readFileSync(join(dir, '.git', 'config'), 'utf8')
    const section = text.split('[remote "origin"]')[1]
    if (!section) return ''
    const match = section.match(/url\s*=\s*(\S+)/)
    if (!match) return ''
    const cleaned = match[1]
      .trim()
      .replace(/^git@github\.com:/, '')
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '')
    return /^[^/\s]+\/[^/\s]+$/.test(cleaned) ? cleaned : ''
  } catch {
    return ''
  }
}

function workspaceRootOf(ctx) {
  const dir = ctx.get('workingDirectory')?.defaultDirectory
  if (typeof dir === 'string' && dir) return dir
  return process.cwd()
}

function listCandidates(ctx) {
  const profileDir = profileDirOf(ctx) ?? ''
  const manifest = profileDir ? readJson(join(profileDir, 'package.json')) : undefined
  const seen = new Set()
  const candidates = []
  if (profileDir) {
    for (const [name, spec] of dependencySpecs(manifest)) {
      if (!spec.startsWith('link:') && !spec.startsWith('file:')) continue
      const dir = resolve(profileDir, spec.slice(5))
      const key = resolve(dir)
      if (seen.has(key)) continue
      seen.add(key)
      if (!existsSync(join(dir, 'package.json'))) continue
      const facts = inspectPlugin(dir)
      if (!facts) continue
      candidates.push({
        ...facts,
        dir,
        spec,
        dependencyName: name,
        installed: true,
        hasGit: existsSync(join(dir, '.git')),
        repoSlug: repoSlugOf(dir),
      })
    }
  }

  const scanRoot = join(workspaceRootOf(ctx), 'plugins')
  if (existsSync(scanRoot)) {
    for (const entry of readdirSync(scanRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = join(scanRoot, entry.name)
      const key = resolve(dir)
      if (seen.has(key)) continue
      seen.add(key)
      if (!existsSync(join(dir, 'package.json'))) continue
      const facts = inspectPlugin(dir)
      if (!facts) continue
      candidates.push({
        ...facts,
        dir,
        spec: '',
        dependencyName: '',
        installed: false,
        hasGit: existsSync(join(dir, '.git')),
        repoSlug: repoSlugOf(dir),
      })
    }
  }

  candidates.sort((left, right) => {
    if (left.installed !== right.installed) return left.installed ? -1 : 1
    return String(left.name).localeCompare(String(right.name))
  })
  return { profileDir, scanRoot, candidates }
}

function defaultRepoName(packageName) {
  const text = String(packageName || '')
  const bare = text.includes('/') ? text.slice(text.lastIndexOf('/') + 1) : text
  return bare
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

async function credentialStatus(ctx) {
  const credentials = ctx.get('credentials')
  if (!credentials) return { available: false, configured: false, writable: false }
  try {
    const info = await credentials.describe(TOKEN_REF)
    return { available: true, configured: info?.configured === true, writable: info?.writable !== false }
  } catch {
    return { available: true, configured: false, writable: false }
  }
}

async function saveToken(ctx, token) {
  const credentials = ctx.get('credentials')
  if (!credentials) return fail('no-credentials', '此环境没有可用的凭据服务，无法保存 GitHub token')
  const value = typeof token === 'string' ? token.trim() : ''
  if (value.length < 20 || /\s/.test(value)) {
    return fail('bad-token', 'token 看起来不合法（至少 20 个字符，且不能包含空白）')
  }
  try {
    await credentials.set(TOKEN_REF, value)
  } catch (error) {
    return fail('save-failed', '保存 token 失败：' + String(error?.message || error))
  }
  return { ok: true, value: await credentialStatus(ctx) }
}

async function clearToken(ctx) {
  const credentials = ctx.get('credentials')
  if (!credentials) return fail('no-credentials', '此环境没有可用的凭据服务')
  try {
    await credentials.unset(TOKEN_REF)
  } catch (error) {
    return fail('clear-failed', '清除 token 失败：' + String(error?.message || error))
  }
  return { ok: true, value: await credentialStatus(ctx) }
}

async function readToken(ctx) {
  const credentials = ctx.get('credentials')
  if (!credentials) return undefined
  try {
    const resolved = await credentials.resolve(TOKEN_REF)
    return resolved && nonEmpty(resolved.value) ? resolved.value : undefined
  } catch {
    return undefined
  }
}

async function github(path, token, options = {}) {
  const response = await fetch(API + path, {
    method: options.method || 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: 'Bearer ' + token,
      'user-agent': 'dsh-market-publish',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(20000),
  })
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { status: response.status, data }
}

function githubMessage(status, data) {
  const message = data && typeof data === 'object' && typeof data.message === 'string' ? data.message : ''
  if (status === 401) return 'GitHub 不认这个 token（401）'
  if (status === 403) return 'GitHub 权限不足或触发限流（403）' + (message ? '：' + message : '')
  if (status === 404) return 'GitHub 找不到对应资源（404）' + (message ? '：' + message : '')
  if (status === 422) return 'GitHub 拒绝了请求（422）' + (message ? '：' + message : '')
  return 'GitHub 请求失败（' + status + '）' + (message ? '：' + message : '')
}

async function resolveGit(ctx) {
  const subprocess = ctx.get('subprocess')
  try {
    const found = await subprocess?.resolveExecutable?.('git')
    if (typeof found === 'string' && found) return found
  } catch {
    /* fall through to common install locations */
  }
  const candidates = [
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
    'E:\\html\\Git\\cmd\\git.exe',
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return 'git'
}

function collect(handle) {
  return [
    handle.collected?.stdout?.readFrom(0)?.text || '',
    handle.collected?.stderr?.readFrom(0)?.text || '',
  ]
    .join('\n')
    .trim()
}

async function runGit(ctx, git, args, options = {}) {
  const subprocess = ctx.get('subprocess')
  if (!subprocess?.spawn) throw new Error('当前环境没有可用的进程服务')
  const handle = subprocess.spawn({
    argv: [git, ...args],
    cwd: options.cwd,
    stdio: {
      stdin: 'ignore',
      stdout: { maxBytes: MAX_OUTPUT },
      stderr: { maxBytes: MAX_OUTPUT },
    },
    graceMs: options.graceMs ?? 120000,
    env: { ...process.env, ...(options.env || {}) },
  })
  const outcome = await handle.done
  return {
    exitCode: typeof outcome?.exitCode === 'number' ? outcome.exitCode : null,
    output: collect(handle),
  }
}

function ensureGitignore(dir) {
  const path = join(dir, '.gitignore')
  if (existsSync(path)) return false
  writeFileSync(path, 'node_modules/\n.DS_Store\n*.log\n.env\n.env.*\n')
  return true
}

async function publish(ctx, job, payload) {
  const dir = typeof payload?.dir === 'string' ? resolve(payload.dir) : ''
  const repoName = typeof payload?.repoName === 'string' ? payload.repoName.trim() : ''
  if (!dir) return fail('bad-request', '缺少插件目录')
  if (!REPO_RE.test(repoName)) {
    return fail('bad-repo', '仓库名只能用字母、数字、点、中划线、下划线，1–100 个字符')
  }

  const { candidates } = listCandidates(ctx)
  const candidate = candidates.find((entry) => resolve(entry.dir) === dir)
  if (!candidate) return fail('not-linked', '只能发布本机目录里的插件（Profile link/file 或工作区 plugins 目录）')
  if (!candidate.hasPatch) return fail('no-patch', 'package.json 的 dsh.bundle.patch 指向的文件不存在')
  if (!candidate.readmeFile) return fail('no-readme', '没有 README，市场收录会拒绝')
  if (!candidate.license && !candidate.licenseFile) return fail('no-license', '没有许可证，市场收录会拒绝')

  const token = await readToken(ctx)
  if (!token) return fail('no-token', '还没有保存 GitHub token')

  const git = await resolveGit(ctx)
  if (git === 'git' && !existsSync(git)) {
    return fail('no-git', '找不到 git 命令，请先安装 Git for Windows')
  }

  const steps = job.steps
  const record = (label, ok, output) => {
    steps.push({ label, ok, output: String(output || '').slice(-2000) })
    return ok
  }

  const me = await github('/user', token)
  if (me.status !== 200 || typeof me.data?.login !== 'string') {
    return fail('auth', githubMessage(me.status, me.data), { steps })
  }
  const login = me.data.login
  const userId = me.data.id
  record('验证 GitHub 账号', true, login)

  const repoPath = '/repos/' + encodeURIComponent(login) + '/' + encodeURIComponent(repoName)
  const existing = await github(repoPath, token)
  let repoCreated = false
  let repoUpdate = false
  if (existing.status === 200) {
    const owner = String(existing.data?.owner?.login || '')
    if (owner && owner.toLowerCase() !== login.toLowerCase()) {
      return fail('repo-other-owner', '同名仓库属于 ' + owner + '，换一个仓库名再试', { steps })
    }
    if (existing.data?.private === true) {
      return fail('repo-private', '同名仓库是私有的，1024store 抓不到；先把它改成公开再试', { steps })
    }
    record('仓库已存在，将推送更新', true, login + '/' + repoName)
    repoUpdate = true
  } else if (existing.status === 404) {
    const created = await github('/user/repos', token, {
      method: 'POST',
      body: {
        name: repoName,
        description: candidate.description.slice(0, 350) || 'DeepSeek Harness plugin',
        private: false,
        has_issues: true,
        auto_init: false,
      },
    })
    if (created.status !== 201) {
      return fail('create-failed', githubMessage(created.status, created.data), { steps })
    }
    repoCreated = true
    record('创建公开仓库', true, login + '/' + repoName)
  } else {
    return fail('repo-check-failed', githubMessage(existing.status, existing.data), { steps })
  }

  const hasGit = existsSync(join(dir, '.git'))
  if (!hasGit) {
    const init = await runGit(ctx, git, ['init'], { cwd: dir })
    if (init.exitCode !== 0) return fail('git-init', 'git init 失败\n' + init.output, { steps })
    await runGit(ctx, git, ['symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: dir })
    record('初始化本地仓库', true, dir)
  } else {
    record('使用已有本地仓库', true, dir)
  }

  const ignored = ensureGitignore(dir)
  record('写入 .gitignore', true, ignored ? 'node_modules/ 等' : '已存在，保持原样')

  const add = await runGit(ctx, git, ['add', '-A'], { cwd: dir })
  if (add.exitCode !== 0) return fail('git-add', 'git add 失败\n' + add.output, { steps })

  const status = await runGit(ctx, git, ['status', '--porcelain'], { cwd: dir })
  if (status.output.trim() !== '') {
    const commit = await runGit(
      ctx,
      git,
      [
        '-c',
        'user.name=' + login,
        '-c',
        'user.email=' + String(userId) + '+' + login + '@users.noreply.github.com',
        'commit',
        '-m',
        repoUpdate ? 'Update from DSH' : 'Initial commit',
      ],
      { cwd: dir },
    )
    if (commit.exitCode !== 0) return fail('git-commit', 'git commit 失败\n' + commit.output, { steps })
    record('提交本地文件', true, 'Initial commit')
  } else {
    record('没有需要提交的改动', true, '')
  }

  const branch = await runGit(ctx, git, ['branch', '--show-current'], { cwd: dir })
  const branchName = branch.output.trim() || 'main'
  const remote = await runGit(ctx, git, ['remote', 'get-url', 'origin'], { cwd: dir })
  const remoteUrl = 'https://github.com/' + login + '/' + repoName + '.git'
  if (remote.exitCode === 0 && remote.output.trim()) {
    const current = remote.output.trim()
    if (!/github\.com[:/]/.test(current)) {
      return fail('remote-conflict', '这个目录的 origin 指向别处：' + current, { steps })
    }
    await runGit(ctx, git, ['remote', 'set-url', 'origin', remoteUrl], { cwd: dir })
  } else {
    const added = await runGit(ctx, git, ['remote', 'add', 'origin', remoteUrl], { cwd: dir })
    if (added.exitCode !== 0) return fail('git-remote', '添加 origin 失败\n' + added.output, { steps })
  }
  record('设置 origin', true, remoteUrl)

  const auth = 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + token).toString('base64')
  const push = await runGit(ctx, git, ['push', '--set-upstream', 'origin', branchName], {
    cwd: dir,
    graceMs: 180000,
    env: {
      GIT_TERMINAL_PROMPT: '0',
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
      GIT_CONFIG_VALUE_0: auth,
    },
  })
  if (push.exitCode !== 0) {
    const hint = /rejected|non-fast-forward|fetch first|behind its remote/i.test(push.output)
      ? '\n本地提交和远端历史不一致：先在这个目录里执行 git pull --rebase，或者换一个仓库名。'
      : ''
    return fail('push-failed', '推送失败\n' + push.output + hint, { steps })
  }
  record('推送代码', true, branchName)

  const currentTopics = await github(repoPath + '/topics', token)
  const names = new Set(
    currentTopics.status === 200 && Array.isArray(currentTopics.data?.names)
      ? currentTopics.data.names
      : [],
  )
  names.add(TOPIC)
  const topics = await github(repoPath + '/topics', token, {
    method: 'PUT',
    body: { names: [...names] },
  })
  if (topics.status !== 200) {
    record('添加 dsh-plugin 话题', false, githubMessage(topics.status, topics.data))
  } else {
    record('添加 dsh-plugin 话题', true, TOPIC)
  }

  return {
    ok: true,
    value: {
      success: true,
      login,
      repo: login + '/' + repoName,
      repoUrl: 'https://github.com/' + login + '/' + repoName,
      repoCreated,
      steps,
    },
  }
}

async function startPublish(ctx, payload) {
  pruneJobs()
  const job = { id: randomUUID(), status: 'running', steps: [], startedAt: Date.now() }
  jobs.set(job.id, job)
  publish(ctx, job, payload)
    .then((result) => {
      if (result?.ok === true) {
        job.status = 'done'
        job.result = result.value
      } else {
        job.status = 'failed'
        job.error = result?.error ?? { code: 'unknown', message: '发布失败' }
      }
    })
    .catch((error) => {
      job.status = 'failed'
      job.error = { code: 'internal', message: String(error?.message || error) }
    })
  return { ok: true, value: { jobId: job.id } }
}

async function jobProgress(payload) {
  const job = jobs.get(typeof payload?.jobId === 'string' ? payload.jobId : '')
  if (!job) return fail('no-job', '找不到这个发布任务（可能已过期）')
  return {
    ok: true,
    value: {
      jobId: job.id,
      status: job.status,
      steps: job.steps,
      result: job.result ?? null,
      error: job.error ?? null,
      startedAt: job.startedAt,
      elapsedMs: Date.now() - job.startedAt,
    },
  }
}

async function listRepos(ctx) {
  const token = await readToken(ctx)
  if (!token) return fail('no-token', '还没有保存 GitHub token')
  const response = await github('/user/repos?per_page=100&sort=updated&affiliation=owner', token)
  if (response.status !== 200 || !Array.isArray(response.data)) {
    return fail('repos-failed', githubMessage(response.status, response.data))
  }
  const repos = response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    private: repo.private === true,
    description: typeof repo.description === 'string' ? repo.description : '',
    updatedAt: repo.updated_at || '',
    defaultBranch: repo.default_branch || '',
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    stars: Number(repo.stargazers_count || 0),
  }))
  repos.sort((left, right) => {
    const leftPlugin = left.topics.includes(TOPIC) ? 0 : 1
    const rightPlugin = right.topics.includes(TOPIC) ? 0 : 1
    if (leftPlugin !== rightPlugin) return leftPlugin - rightPlugin
    return String(right.updatedAt).localeCompare(String(left.updatedAt))
  })
  return { ok: true, value: { repos } }
}

const listedCache = new Map()
const LISTED_TTL = 30 * 60 * 1000
const CATALOG_RAW =
  'https://raw.githubusercontent.com/imsai-sh/awesome-deepseek-harness-plugins/main/catalog/plugins/'
const CATALOG_CDN =
  'https://cdn.jsdelivr.net/gh/imsai-sh/awesome-deepseek-harness-plugins@main/catalog/plugins/'

async function catalogHasEntry(file) {
  try {
    const response = await fetch(CATALOG_RAW + file, { signal: AbortSignal.timeout(8000) })
    if (response.status === 200) return true
    if (response.status === 404) return false
  } catch {
    /* fall through to the CDN */
  }
  try {
    const response = await fetch(CATALOG_CDN + file, { signal: AbortSignal.timeout(8000) })
    return response.status === 200
  } catch {
    return false
  }
}

async function listedStatus(payload) {
  const slugs = Array.isArray(payload?.repos)
    ? [...new Set(payload.repos.filter((slug) => typeof slug === 'string' && /^[^/\s]+\/[^/\s]+$/.test(slug)))].slice(0, 20)
    : []
  const repos = {}
  for (const slug of slugs) {
    const cached = listedCache.get(slug)
    if (cached && Date.now() - cached.at < LISTED_TTL) {
      repos[slug] = cached.value
      continue
    }
    try {
      const listed = await catalogHasEntry(catalogFileName(slug))
      const value = listed
        ? { listed: true, url: 'https://deepseek1024.com/plugins/' + slug }
        : { listed: false }
      listedCache.set(slug, { at: Date.now(), value })
      repos[slug] = value
    } catch {
      repos[slug] = { listed: false, error: true }
    }
  }
  return { ok: true, value: { repos } }
}

const CATEGORIES = new Set([
  'tools',
  'ui',
  'dev',
  'skill',
  'session',
  'model',
  'workflow',
  'fun',
  'notify',
  'theme',
  'memory',
])

const CATALOG_REPO = 'imsai-sh/awesome-deepseek-harness-plugins'

function catalogFileName(id) {
  return (
    id
      .split('/')
      .map((segment) => segment.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
      .join('--') + '.json'
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ensureCatalogFork(login, token) {
  const name = login + '/awesome-deepseek-harness-plugins'
  let fork = await github('/repos/' + name, token)
  if (fork.status === 200) return fork.data
  await github('/repos/' + CATALOG_REPO + '/forks', token, { method: 'POST', body: {} })
  for (let i = 0; i < 20; i++) {
    await sleep(3000)
    fork = await github('/repos/' + name, token)
    if (fork.status === 200) return fork.data
  }
  return undefined
}

async function submitToStore(ctx, payload) {
  const dir = typeof payload?.dir === 'string' ? resolve(payload.dir) : ''
  const { candidates } = listCandidates(ctx)
  const candidate = candidates.find((entry) => resolve(entry.dir) === dir)
  if (!candidate) return fail('not-found', '找不到这个插件目录')
  const slug = candidate.repoSlug
  if (!slug) return fail('no-repo', '这个插件还没有 GitHub 仓库，先点「发布到 GitHub」')

  const token = await readToken(ctx)
  if (!token) return fail('no-token', '还没有保存 GitHub token')

  const me = await github('/user', token)
  if (me.status !== 200 || typeof me.data?.login !== 'string') {
    return fail('auth', githubMessage(me.status, me.data))
  }
  const login = me.data.login

  const repo = await github('/repos/' + slug, token)
  if (repo.status !== 200) return fail('repo-missing', 'GitHub 上找不到 ' + slug)
  if (repo.data?.private === true) return fail('private-repo', '仓库是私有的，1024store 抓不到，先改成公开')

  const topics = await github('/repos/' + slug + '/topics', token)
  const names = new Set(topics.status === 200 && Array.isArray(topics.data?.names) ? topics.data.names : [])
  if (!names.has(TOPIC)) {
    names.add(TOPIC)
    await github('/repos/' + slug + '/topics', token, { method: 'PUT', body: { names: [...names] } })
  }

  const already = await listedStatus({ repos: [slug] })
  if (already?.value?.repos?.[slug]?.listed) {
    return { ok: true, value: { listed: true, url: already.value.repos[slug].url, repo: slug } }
  }

  const category = CATEGORIES.has(payload?.category) ? payload.category : 'dev'
  const file = catalogFileName(slug)
  const filePath = 'catalog/plugins/' + file

  const upstreamFile = await github('/repos/' + CATALOG_REPO + '/contents/' + filePath + '?ref=main', token)
  if (upstreamFile.status === 200) {
    return {
      ok: true,
      value: { listed: true, pendingSync: true, url: 'https://deepseek1024.com/plugins/' + slug, repo: slug },
    }
  }

  const fork = await ensureCatalogFork(login, token)
  if (!fork) return fail('fork-failed', '创建目录仓库的 fork 失败')

  const base = fork.default_branch || 'main'
  const baseRef = await github('/repos/' + fork.full_name + '/git/ref/heads/' + base, token)
  if (baseRef.status !== 200) return fail('base-ref', '读取 fork 的默认分支失败：' + githubMessage(baseRef.status, baseRef.data))

  const branch = 'add-' + file.replace(/\.json$/, '') + '-' + Date.now()
  const branchRef = await github('/repos/' + fork.full_name + '/git/refs', token, {
    method: 'POST',
    body: { ref: 'refs/heads/' + branch, sha: baseRef.data.object.sha },
  })
  if (branchRef.status !== 201) {
    return fail('branch-failed', '创建分支失败：' + githubMessage(branchRef.status, branchRef.data))
  }

  const description = candidate.description || slug + ' plugin for DeepSeek Harness'
  const entry = {
    $schema: '../schema/plugin.schema.json',
    id: slug,
    name: slug.split('/')[1] || slug,
    repository: 'https://github.com/' + slug,
    category,
    description: { en: description, zh: description },
    added: new Date().toISOString().slice(0, 10),
  }

  const put = await github('/repos/' + fork.full_name + '/contents/' + filePath, token, {
    method: 'PUT',
    body: {
      message: 'Add ' + slug,
      content: Buffer.from(JSON.stringify(entry, null, 2) + '\n').toString('base64'),
      branch,
    },
  })
  if (put.status !== 201) {
    return fail('file-failed', '写入目录条目失败：' + githubMessage(put.status, put.data))
  }

  const pr = await github('/repos/' + CATALOG_REPO + '/pulls', token, {
    method: 'POST',
    body: {
      title: 'Add ' + slug,
      head: login + ':' + branch,
      base: 'main',
      body:
        'Adds `' +
        slug +
        '` to the catalog.\n\n- id: `' +
        slug +
        '`\n- category: `' +
        category +
        '`\n- repository is public, carries the `dsh-plugin` topic, and keeps `dsh.bundle.patch` plus the patch file in the default branch',
    },
  })
  if (pr.status !== 201) {
    return fail('pr-failed', '创建 PR 失败：' + githubMessage(pr.status, pr.data))
  }

  return {
    ok: true,
    value: {
      listed: false,
      repo: slug,
      prUrl: pr.data.html_url,
      number: pr.data.number,
    },
  }
}

const syncCache = new Map()

async function syncStatus(ctx, payload) {
  const dirs = Array.isArray(payload?.dirs)
    ? [...new Set(payload.dirs.filter((dir) => typeof dir === 'string'))].slice(0, 20)
    : []
  const token = await readToken(ctx)
  if (!token) return fail('no-token', '还没有保存 GitHub token')
  const git = await resolveGit(ctx)
  const { candidates } = listCandidates(ctx)
  const out = {}
  for (const dir of dirs) {
    const key = resolve(dir)
    const cached = syncCache.get(key)
    if (cached && Date.now() - cached.at < 20000) {
      out[key] = cached.value
      continue
    }
    const candidate = candidates.find((entry) => resolve(entry.dir) === key)
    if (!candidate?.repoSlug) {
      out[key] = { skip: true }
      continue
    }
    const head = await runGit(ctx, git, ['rev-parse', 'HEAD'], { cwd: key })
    if (head.exitCode !== 0) {
      out[key] = { error: 'no-head' }
      continue
    }
    const localSha = head.output.trim().split('\n')[0]
    const dirtyResult = await runGit(ctx, git, ['status', '--porcelain'], { cwd: key })
    const dirty = dirtyResult.output.trim() !== ''
    const branchResult = await runGit(ctx, git, ['branch', '--show-current'], { cwd: key })
    const branch = branchResult.output.trim() || 'main'
    const value = { dirty, localSha, branch }
    const remote = await github(
      '/repos/' + candidate.repoSlug + '/commits/' + encodeURIComponent(branch),
      token,
    )
    if (remote.status === 200 && typeof remote.data?.sha === 'string') {
      value.remoteSha = remote.data.sha
      if (remote.data.sha === localSha) {
        value.upToDate = !dirty
        value.ahead = 0
        value.behind = 0
      } else {
        const compare = await github(
          '/repos/' + candidate.repoSlug + '/compare/' + remote.data.sha + '...' + localSha,
          token,
        )
        if (compare.status === 200) {
          value.compare = compare.data.status
          value.ahead = Number(compare.data.ahead_by || 0)
          value.behind = Number(compare.data.behind_by || 0)
          value.upToDate = !dirty && value.ahead === 0 && value.behind === 0
        }
      }
    } else if (remote.status === 404) {
      value.error = 'remote-branch'
    }
    value.needsPush = dirty || Number(value.ahead || 0) > 0 || value.compare === 'diverged'
    value.needsPull = Number(value.behind || 0) > 0 || value.compare === 'diverged'
    syncCache.set(key, { at: Date.now(), value })
    out[key] = value
  }
  return { ok: true, value: { dirs: out } }
}

function route(ctx, path, handler) {
  const connection = ctx.get('connection')
  if (!connection?.fetch?.register) return undefined
  return connection.fetch.register({
    path,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      if (request.method !== 'POST') {
        return jsonResponse(405, { ok: false, error: { code: 'method', message: 'POST only' } })
      }
      let payload
      try {
        payload = await request.json()
      } catch {
        return jsonResponse(400, { ok: false, error: { code: 'bad-request', message: 'invalid JSON' } })
      }
      try {
        const result = await handler(payload ?? {})
        return jsonResponse(200, result)
      } catch (error) {
        return jsonResponse(200, fail('internal', String(error?.message || error)))
      }
    },
  })
}

export function apply(ctx) {
  if (!profileDirOf(ctx)) return
  const connection = ctx.get('connection')
  if (!connection?.fetch?.register) return

  ctx.effect(
    () =>
      route(ctx, '/api/github-publish/list', async () => ({
        ok: true,
        value: listCandidates(ctx),
      })),
    'github-publish: list route',
  )

  ctx.effect(
    () =>
      route(ctx, '/api/github-publish/token', async (payload) => {
        if (payload?.action === 'save') return saveToken(ctx, payload.token)
        if (payload?.action === 'clear') return clearToken(ctx)
        return { ok: true, value: await credentialStatus(ctx) }
      }),
    'github-publish: token route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/publish', async (payload) => startPublish(ctx, payload)),
    'github-publish: publish route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/progress', async (payload) => jobProgress(payload)),
    'github-publish: progress route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/repos', async () => listRepos(ctx)),
    'github-publish: repos route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/listed', async (payload) => listedStatus(payload)),
    'github-publish: listed route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/submit', async (payload) => submitToStore(ctx, payload)),
    'github-publish: submit route',
  )

  ctx.effect(
    () => route(ctx, '/api/github-publish/sync', async (payload) => syncStatus(ctx, payload)),
    'github-publish: sync route',
  )
}

export const inject = ['connection']
