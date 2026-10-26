window.__ModuleLoader__.load({
  id: '@local/dsh-market-publish',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'dshGithubPublish'
    const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=DSH%20plugin%20publish'

    const zh = {
      tab: '发布',
      title: '发布到 GitHub',
      subtitle:
        '把本地插件推送成公开 GitHub 仓库，并加上 dsh-plugin 话题。发布状态和每一步输出都留在页面上，失败时能看到具体原因。',
      refresh: '刷新',
      refreshing: '正在刷新…',
      loading: '正在读取本地插件…',
      loadError: '读取本地插件失败',
      retry: '重试',
      empty: '没有找到以 link / file 安装的本地插件。',
      profile: 'Profile',
      tokenTitle: 'GitHub 身份',
      tokenSaved: '已保存',
      tokenMissing: '未保存',
      tokenUnavailable: '凭据服务不可用',
      tokenPlaceholder: '粘贴 GitHub token（ghp_… 或 github_pat_…）',
      save: '保存',
      saving: '保存中…',
      clear: '清除',
      tokenHint:
        'GitHub → Settings → Developer settings → Personal access tokens：classic 勾 repo；fine-grained 给 Contents 和 Administration 写权限。token 只用于建仓、推送和设置话题。',
      tokenLink: '生成 GitHub token ↗',
      checks: '发布前检查',
      required: '必需',
      checkPkg: '包信息',
      checkPatch: 'bundle patch',
      checkReadme: 'README',
      checkLicense: '许可证',
      hintPkg: 'package.json 缺少合法的 name 或 version。',
      hintPatch: 'dsh.bundle.patch 指向的文件不存在。',
      hintReadme: '没有 README，市场收录会拒绝。',
      hintLicense: '没有 license 字段或 LICENSE 文件。',
      gitReady: '本地 git：已初始化',
      gitFresh: '本地 git：未初始化（发布时创建）',
      repoName: '仓库名',
      repoNamespace: '会创建在 github.com/<你>/',
      repoNameHint: '公开仓库；重名且非空会失败，换一个名字即可。',
      publish: '发布到 GitHub',
      confirming: '确认发布',
      confirmText: '会创建公开仓库、提交并推送当前目录全部文件，然后加 dsh-plugin 话题。确认？',
      cancel: '取消',
      busy: '推送中…',
      statusTitle: '发布状态',
      running: '正在发布…',
      elapsed: '已用时',
      seconds: '秒',
      failedTitle: '发布失败',
      doneTitle: '发布完成',
      copyError: '复制错误',
      copyUrl: '复制仓库地址',
      copied: '已复制',
      showOutput: '查看输出',
      steps: '步骤',
      nextTitle: '下一步',
      nextHint:
        '1024store 会定期抓取带 dsh-plugin 话题的公开仓库。也可以现在去 dsh.so 手动提交，或者打开仓库确认代码。',
      nextDshSo: 'dsh.so · 提交仓库 ↗',
      nextRepo: '打开 GitHub 仓库 ↗',
      nextStore: '打开 1024store ↗',
      notReady: '检查未通过',
      tokenRequired: '先保存 GitHub token',
      badName: '仓库名不合法',
      account: '账号',
      repo: '仓库',
      reposTitle: '我的 GitHub 仓库',
      reposHint: '这个 token 对应账号下的仓库，按最近更新排序；带 dsh-plugin 话题的排在最前。',
      reposRefresh: '刷新仓库',
      reposLoading: '正在读取仓库…',
      reposEmpty: '这个账号下还没有仓库。',
      reposError: '读取仓库失败',
      reposNeedToken: '保存 GitHub token 后，这里会列出你的仓库。',
      installedBadge: '已安装',
      notInstalledBadge: '未安装',
      scanHint: '扫描目录',
      scanAuto: '新插件放进这个目录会自动出现（每 15 秒检查）。',
      topicBadge: 'dsh-plugin',
      privateBadge: '私有',
      publicBadge: '公开',
      open: '打开',
      updated: '更新于',
      showMore: '显示全部',
      showLess: '收起',
      autoRefresh: '每 15 秒自动刷新',
      updatedLabel: '更新于',
    }

    const en = {
      tab: 'Publish',
      title: 'Publish to GitHub',
      subtitle:
        'Push a local plugin as a public GitHub repository with the dsh-plugin topic. Publish status and every step output stay on the page, so failures are readable.',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      loading: 'Reading local plugins…',
      loadError: 'Could not read local plugins',
      retry: 'Retry',
      empty: 'No link / file installed local plugins.',
      profile: 'Profile',
      tokenTitle: 'GitHub identity',
      tokenSaved: 'Saved',
      tokenMissing: 'Not saved',
      tokenUnavailable: 'Credential service unavailable',
      tokenPlaceholder: 'Paste a GitHub token (ghp_… or github_pat_…)',
      save: 'Save',
      saving: 'Saving…',
      clear: 'Clear',
      tokenHint:
        'GitHub → Settings → Developer settings → Personal access tokens: classic with repo, or fine-grained with Contents and Administration write. Used only to create the repo, push, and set topics.',
      tokenLink: 'Create a GitHub token ↗',
      checks: 'Preflight',
      required: 'required',
      checkPkg: 'Package',
      checkPatch: 'Bundle patch',
      checkReadme: 'README',
      checkLicense: 'License',
      hintPkg: 'package.json has no valid name or version.',
      hintPatch: 'The file referenced by dsh.bundle.patch is missing.',
      hintReadme: 'No README; catalogs reject that.',
      hintLicense: 'No license field or LICENSE file.',
      gitReady: 'Local git: initialised',
      gitFresh: 'Local git: not initialised (created on publish)',
      repoName: 'Repository',
      repoNamespace: 'Created under github.com/<you>/',
      repoNameHint: 'Public repository; a non-empty name collision fails, pick another name.',
      publish: 'Publish to GitHub',
      confirming: 'Confirm publish',
      confirmText: 'Creates a public repository, commits and pushes every file, then adds the dsh-plugin topic. Continue?',
      cancel: 'Cancel',
      busy: 'Pushing…',
      statusTitle: 'Publish status',
      running: 'Publishing…',
      elapsed: 'Elapsed',
      seconds: 's',
      failedTitle: 'Publish failed',
      doneTitle: 'Published',
      copyError: 'Copy error',
      copyUrl: 'Copy repository URL',
      copied: 'Copied',
      showOutput: 'Show output',
      steps: 'Steps',
      nextTitle: 'Next',
      nextHint:
        '1024store periodically crawls public repositories with the dsh-plugin topic. You can also submit it to dsh.so now, or open the repository to check the code.',
      nextDshSo: 'dsh.so · submit repository ↗',
      nextRepo: 'Open the GitHub repository ↗',
      nextStore: 'Open 1024store ↗',
      notReady: 'Preflight failed',
      tokenRequired: 'Save a GitHub token first',
      badName: 'Invalid repository name',
      account: 'Account',
      repo: 'Repository',
      reposTitle: 'My GitHub repositories',
      reposHint: 'Repositories under this token, newest first; repositories with the dsh-plugin topic come first.',
      reposRefresh: 'Refresh repositories',
      reposLoading: 'Reading repositories…',
      reposEmpty: 'This account has no repositories yet.',
      reposError: 'Could not read repositories',
      reposNeedToken: 'Save a GitHub token to list your repositories here.',
      installedBadge: 'Installed',
      notInstalledBadge: 'Not installed',
      scanHint: 'Scanning',
      scanAuto: 'New plugin folders appear here automatically (checked every 15s).',
      topicBadge: 'dsh-plugin',
      privateBadge: 'Private',
      publicBadge: 'Public',
      open: 'Open',
      updated: 'Updated',
      showMore: 'Show all',
      showLess: 'Show less',
      autoRefresh: 'Auto-refresh every 15s',
      updatedLabel: 'Updated',
    }

    const CSS = `
.dsgh-page { display: flex; flex-direction: column; gap: 18px; padding: 18px 24px 48px; max-width: 1180px; margin: 0 auto; color: var(--dsw-alias-label-primary); font-size: 13px; box-sizing: border-box; }
.dsgh-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dsgh-title { margin: 0 0 6px; font-size: 18px; line-height: 1.3; font-weight: 650; }
.dsgh-sub { margin: 0; max-width: 700px; font-size: 12px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }
.dsgh-section { display: flex; flex-direction: column; gap: 10px; }
.dsgh-section-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsgh-section h3 { margin: 0; font-size: 13px; font-weight: 650; }
.dsgh-grid { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); gap: 20px; align-items: start; }
.dsgh-col { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.dsgh-col-right { position: sticky; top: 4px; }
.dsgh-hint { margin: 0; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.dsgh-card { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.dsgh-card-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.dsgh-card-head strong { font-size: 14px; font-weight: 650; overflow-wrap: anywhere; }
.dsgh-pkg { font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace; font-size: 11px; line-height: 1.5; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dsgh-desc { font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.dsgh-tag { flex: none; padding: 3px 7px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; font-size: 10px; line-height: 1.2; white-space: nowrap; color: var(--dsw-alias-label-secondary); }
.dsgh-tag.on { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.dsgh-tag.off { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
.dsgh-tag.err { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.dsgh-checks { display: flex; flex-wrap: wrap; gap: 6px 8px; }
.dsgh-check { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; font-size: 11px; line-height: 1.3; color: var(--dsw-alias-label-secondary); }
.dsgh-check.ok { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.dsgh-check.bad { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.dsgh-hints { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; font-size: 11px; line-height: 1.5; color: var(--dsw-alias-state-warn-primary); }
.dsgh-repo { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.dsgh-label { font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.dsgh-input { flex: 1 1 260px; min-width: 200px; font: inherit; font-size: 12px; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.dsgh-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.dsgh-btn { appearance: none; font: inherit; font-size: 12px; line-height: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-primary); cursor: pointer; white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
.dsgh-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
.dsgh-btn:disabled { opacity: .55; cursor: default; }
.dsgh-btn.primary { color: #fff; background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.dsgh-btn.primary:hover:not(:disabled) { filter: brightness(1.06); }
.dsgh-btn.danger { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.dsgh-btn.small { padding: 6px 9px; font-size: 11px; }
.dsgh-result { white-space: pre-wrap; overflow-wrap: anywhere; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.dsgh-result.err { color: var(--dsw-alias-state-error-primary); }
.dsgh-empty { padding: 16px; border: 1px dashed var(--dsw-alias-border-l1); border-radius: 10px; text-align: center; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dsgh-token { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.dsgh-banner { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); }
.dsgh-banner.ok { border-color: var(--dsw-alias-state-success-primary); }
.dsgh-banner.err { border-color: var(--dsw-alias-state-error-primary); }
.dsgh-banner-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 650; }
.dsgh-banner.ok .dsgh-banner-title { color: var(--dsw-alias-state-success-primary); }
.dsgh-banner.err .dsgh-banner-title { color: var(--dsw-alias-state-error-primary); }
.dsgh-banner-text { font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; overflow-wrap: anywhere; }
.dsgh-spinner { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); animation: dsgh-spin .8s linear infinite; flex: none; }
@keyframes dsgh-spin { to { transform: rotate(360deg); } }
.dsgh-steps { display: flex; flex-direction: column; gap: 6px; }
.dsgh-step { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; line-height: 1.5; }
.dsgh-step .mark { flex: none; width: 14px; }
.dsgh-step .mark.ok { color: var(--dsw-alias-state-success-primary); }
.dsgh-step .mark.bad { color: var(--dsw-alias-state-error-primary); }
.dsgh-step .detail { min-width: 0; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); }
.dsgh-step details { margin-top: 4px; }
.dsgh-step summary { cursor: pointer; font-size: 11px; color: var(--dsw-alias-brand-primary); }
.dsgh-step pre { margin: 4px 0 0; padding: 8px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); white-space: pre-wrap; overflow-wrap: anywhere; font-size: 11px; line-height: 1.45; color: var(--dsw-alias-label-secondary); max-height: 220px; overflow: auto; }
.dsgh-repos { display: flex; flex-direction: column; gap: 8px; max-height: 440px; overflow: auto; padding-right: 2px; }
.dsgh-repo-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.dsgh-repo-main { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.dsgh-repo-name { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.dsgh-repo-name a { color: var(--dsw-alias-brand-primary); text-decoration: none; font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.dsgh-repo-name a:hover { text-decoration: underline; }
.dsgh-repo-desc { font-size: 11px; line-height: 1.45; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dsgh-repo-meta { font-size: 10px; color: var(--dsw-alias-label-secondary); }
.dsgh-repo-actions { flex: none; display: flex; gap: 6px; align-items: center; }
.dsgh-links { display: flex; flex-wrap: wrap; gap: 8px; }
@media (max-width: 900px) {
  .dsgh-grid { grid-template-columns: 1fr; }
  .dsgh-col-right { position: static; }
}
@media (max-width: 560px) {
  .dsgh-page { padding: 14px 14px 36px; }
  .dsgh-card { padding: 12px; }
  .dsgh-repo-row { flex-direction: column; }
  .dsgh-repo-actions { align-self: flex-end; }
}
`

    function errorText(error) {
      if (!error) return ''
      if (typeof error === 'string') return error
      return String(error.message || error.code || error)
    }

    async function callHost(endpoint, payload) {
      let response
      try {
        response = await fetch('/api/github-publish/' + endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload ?? {}),
        })
      } catch (error) {
        throw new Error('fetch: ' + errorText(error))
      }
      let result = null
      try {
        result = await response.json()
      } catch {
        result = null
      }
      if (!response.ok || result?.ok !== true) {
        const detail = result?.error
        throw new Error(
          (detail?.code ? String(detail.code) + ': ' : '') +
            String(detail?.message || (result == null ? 'HTTP ' + response.status : 'request failed')),
        )
      }
      return result.value
    }

    function repoNameFrom(packageName) {
      const text = String(packageName || '')
      const bare = text.includes('/') ? text.slice(text.lastIndexOf('/') + 1) : text
      return bare
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100)
    }

    function elapsedText(ms) {
      return String(Math.max(0, Math.round(Number(ms || 0) / 1000)))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'github-publish: dictionaries')
        const t = ctx.locale.bind(NS)

        function PublishPage() {
          const [tick, setTick] = React.useState(0)
          const [list, setList] = React.useState({ status: 'loading', profileDir: '', scanRoot: '', items: [], error: null })
          const [token, setToken] = React.useState({ available: true, configured: false, writable: true })
          const [draft, setDraft] = React.useState('')
          const [saving, setSaving] = React.useState(false)
          const [busy, setBusy] = React.useState(null)
          const [confirming, setConfirming] = React.useState(null)
          const [repoNames, setRepoNames] = React.useState({})
          const [notice, setNotice] = React.useState(null)
          const [job, setJob] = React.useState(null)
          const [now, setNow] = React.useState(Date.now())
          const [copied, setCopied] = React.useState(null)
          const [repos, setRepos] = React.useState([])
          const [reposStatus, setReposStatus] = React.useState('idle')
          const [reposError, setReposError] = React.useState('')
          const [reposAt, setReposAt] = React.useState(0)
          const [showAllRepos, setShowAllRepos] = React.useState(false)
          const pollRef = React.useRef(null)

          const stopPoll = React.useCallback(() => {
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
          }, [])

          React.useEffect(() => () => stopPoll(), [stopPoll])

          React.useEffect(() => {
            if (!job || job.status !== 'running') return undefined
            const timer = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(timer)
          }, [job])

          React.useEffect(() => {
            const offLocale = ctx.locale.subscribe(() => setTick((value) => value + 1))
            return () => offLocale()
          }, [])

          const loadList = React.useCallback(async (silent) => {
            if (!silent) {
              setList((current) => ({
                ...current,
                status: current.items.length ? 'refreshing' : 'loading',
                error: null,
              }))
            }
            try {
              const value = await callHost('list')
              setList({
                status: 'ready',
                profileDir: String(value?.profileDir || ''),
                scanRoot: String(value?.scanRoot || ''),
                items: Array.isArray(value?.candidates) ? value.candidates : [],
                error: null,
              })
            } catch (error) {
              if (!silent) setList((current) => ({ ...current, status: 'error', error: errorText(error) }))
            }
          }, [tick])

          const loadToken = React.useCallback(async () => {
            try {
              const value = await callHost('token', { action: 'status' })
              setToken({
                available: value?.available !== false,
                configured: value?.configured === true,
                writable: value?.writable !== false,
              })
            } catch {
              setToken({ available: false, configured: false, writable: false })
            }
          }, [tick])

          const loadRepos = React.useCallback(async (silent) => {
            if (!token.configured) {
              setReposStatus('idle')
              return
            }
            if (!silent) setReposStatus('loading')
            setReposError('')
            try {
              const value = await callHost('repos')
              setRepos(Array.isArray(value?.repos) ? value.repos : [])
              setReposStatus('ready')
              setReposAt(Date.now())
            } catch (error) {
              setReposStatus('error')
              setReposError(errorText(error))
            }
          }, [token.configured, tick])

          React.useEffect(() => {
            loadList()
          }, [loadList])

          React.useEffect(() => {
            const timer = setInterval(() => {
              if (document.visibilityState === 'visible' && !busy) loadList(true)
            }, 15000)
            return () => clearInterval(timer)
          }, [busy, loadList])

          React.useEffect(() => {
            loadToken()
          }, [loadToken])

          React.useEffect(() => {
            loadRepos()
          }, [loadRepos])

          React.useEffect(() => {
            if (!token.configured) return undefined
            const timer = setInterval(() => {
              if (document.visibilityState === 'visible' && !busy) loadRepos(true)
            }, 15000)
            return () => clearInterval(timer)
          }, [token.configured, busy, loadRepos])

          React.useEffect(() => {
            if (!token.configured) return undefined
            const onVisible = () => {
              if (document.visibilityState === 'visible') loadRepos(true)
            }
            document.addEventListener('visibilitychange', onVisible)
            return () => document.removeEventListener('visibilitychange', onVisible)
          }, [token.configured, loadRepos])

          React.useEffect(() => {
            if (!notice) return undefined
            const timer = setTimeout(() => setNotice(null), 7000)
            return () => clearTimeout(timer)
          }, [notice])

          async function copyText(text, key) {
            try {
              await navigator.clipboard.writeText(String(text))
              setCopied(key)
              setTimeout(() => setCopied(null), 1600)
            } catch {
              setNotice({ kind: 'error', text: String(text) })
            }
          }

          async function saveToken() {
            if (!draft.trim()) return
            setSaving(true)
            setNotice(null)
            try {
              const value = await callHost('token', { action: 'save', token: draft })
              setToken({
                available: true,
                configured: value?.configured === true,
                writable: value?.writable !== false,
              })
              setDraft('')
              setNotice({ kind: 'ok', text: t('tokenSaved') })
            } catch (error) {
              setNotice({ kind: 'error', text: errorText(error) })
            } finally {
              setSaving(false)
            }
          }

          async function clearToken() {
            setSaving(true)
            setNotice(null)
            try {
              const value = await callHost('token', { action: 'clear' })
              setToken({
                available: true,
                configured: value?.configured === true,
                writable: value?.writable !== false,
              })
              setRepos([])
              setReposStatus('idle')
              setNotice({ kind: 'ok', text: t('clear') })
            } catch (error) {
              setNotice({ kind: 'error', text: errorText(error) })
            } finally {
              setSaving(false)
            }
          }

          const pollJob = React.useCallback(
            (jobId, item) => {
              stopPoll()
              const step = async () => {
                try {
                  const value = await callHost('progress', { jobId })
                  setJob({ ...value, name: item.name, version: item.version })
                  if (value.status !== 'running') {
                    stopPoll()
                    setBusy(null)
                    loadList()
                    loadRepos()
                  }
                } catch (error) {
                  stopPoll()
                  setBusy(null)
                  setJob({
                    status: 'failed',
                    steps: [],
                    error: { code: 'progress', message: errorText(error) },
                    name: item.name,
                    version: item.version,
                  })
                }
              }
              step()
              pollRef.current = setInterval(step, 700)
            },
            [stopPoll, loadList, loadRepos],
          )

          async function runPublish(item) {
            const repoName = (repoNames[item.dir] ?? repoNameFrom(item.name)).trim()
            setConfirming(null)
            setBusy(item.dir)
            setJob(null)
            setNotice(null)
            setNow(Date.now())
            try {
              const value = await callHost('publish', { dir: item.dir, repoName })
              if (!value?.jobId) throw new Error('no job id')
              setJob({
                status: 'running',
                steps: [],
                startedAt: Date.now(),
                name: item.name,
                version: item.version,
                jobId: value.jobId,
              })
              pollJob(value.jobId, item)
            } catch (error) {
              setBusy(null)
              setJob({
                status: 'failed',
                steps: [],
                error: { code: 'start', message: errorText(error) },
                name: item.name,
                version: item.version,
              })
            }
          }

          function checksOf(item) {
            return [
              {
                id: 'pkg',
                ok: Boolean(item.name) && /^\d+\.\d+\.\d+/.test(String(item.version || '')),
                label: t('checkPkg'),
                hint: t('hintPkg'),
              },
              {
                id: 'patch',
                ok: item.hasPatch === true,
                label: t('checkPatch'),
                hint: t('hintPatch'),
              },
              {
                id: 'readme',
                ok: Boolean(item.readmeFile),
                label: t('checkReadme'),
                hint: t('hintReadme'),
              },
              {
                id: 'license',
                ok: Boolean(item.license || item.licenseFile),
                label: t('checkLicense'),
                hint: t('hintLicense'),
              },
            ]
          }

          function card(item) {
            const checks = checksOf(item)
            const ready = checks.every((check) => check.ok)
            const failedHints = checks.filter((check) => !check.ok && check.hint).map((check) => check.hint)
            const isBusy = busy === item.dir
            const isConfirming = confirming === item.dir
            const repoName = repoNames[item.dir] ?? repoNameFrom(item.name)
            const nameOk = /^[A-Za-z0-9._-]{1,100}$/.test(repoName)
            const canPublish = ready && nameOk && token.configured && !isBusy
            return h(
              'div',
              { className: 'dsgh-card', key: item.dir },
              h(
                'div',
                { className: 'dsgh-card-head' },
                h('strong', null, item.name),
                h('span', { className: 'dsgh-tag' }, 'v' + (item.version || '0.0.0')),
                h(
                  'span',
                  { className: 'dsgh-tag' + (item.installed ? '' : ' off') },
                  item.installed ? t('installedBadge') : t('notInstalledBadge'),
                ),
                h(
                  'span',
                  { className: 'dsgh-tag ' + (item.hasGit ? 'on' : 'off') },
                  item.hasGit ? t('gitReady') : t('gitFresh'),
                ),
              ),
              h('div', { className: 'dsgh-pkg' }, item.dir),
              item.description ? h('div', { className: 'dsgh-desc' }, item.description) : null,
              h(
                'div',
                { className: 'dsgh-checks' },
                checks.map((check) =>
                  h(
                    'span',
                    { className: 'dsgh-check ' + (check.ok ? 'ok' : 'bad'), key: check.id, title: check.ok ? '' : check.hint },
                    (check.ok ? '✓ ' : '✗ ') + check.label,
                  ),
                ),
              ),
              failedHints.length
                ? h('ul', { className: 'dsgh-hints' }, failedHints.map((hint) => h('li', { key: hint }, hint)))
                : null,
              h(
                'div',
                { className: 'dsgh-repo' },
                h('span', { className: 'dsgh-label' }, t('repoName')),
                h('input', {
                  className: 'dsgh-input',
                  value: repoName,
                  spellCheck: false,
                  disabled: isBusy,
                  onChange: (event) =>
                    setRepoNames((current) => ({ ...current, [item.dir]: event.target.value })),
                }),
              ),
              h(
                'p',
                { className: 'dsgh-hint' },
                t('repoNamespace') + (repoName || '…') + ' · ' + t('repoNameHint'),
              ),
              h(
                'div',
                { className: 'dsgh-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsgh-btn primary',
                    disabled: !canPublish,
                    title: !ready ? t('notReady') : !nameOk ? t('badName') : !token.configured ? t('tokenRequired') : '',
                    onClick: () => setConfirming(isConfirming ? null : item.dir),
                  },
                  isBusy ? t('busy') : t('publish'),
                ),
                isConfirming
                  ? h(
                      'button',
                      { type: 'button', className: 'dsgh-btn danger', disabled: isBusy, onClick: () => runPublish(item) },
                      t('confirming'),
                    )
                  : null,
                isConfirming
                  ? h('button', { type: 'button', className: 'dsgh-btn', onClick: () => setConfirming(null) }, t('cancel'))
                  : null,
              ),
              isConfirming ? h('div', { className: 'dsgh-result' }, t('confirmText')) : null,
            )
          }

          function statusPanel() {
            if (!job) return null
            const running = job.status === 'running'
            const failed = job.status === 'failed'
            const done = job.status === 'done'
            const elapsed = running
              ? elapsedText(now - (job.startedAt || now))
              : elapsedText(job.elapsedMs || 0)
            return h(
              'section',
              { className: 'dsgh-section' },
              h('h3', null, t('statusTitle') + ' · ' + (job.name || '') + ' · v' + (job.version || '')),
              running
                ? h(
                    'div',
                    { className: 'dsgh-banner' },
                    h('div', { className: 'dsgh-banner-title' }, h('span', { className: 'dsgh-spinner' }), t('running')),
                    h('div', { className: 'dsgh-banner-text' }, t('elapsed') + ' ' + elapsed + ' ' + t('seconds')),
                  )
                : null,
              failed
                ? h(
                    'div',
                    { className: 'dsgh-banner err' },
                    h(
                      'div',
                      { className: 'dsgh-banner-title' },
                      h('span', null, '✗'),
                      t('failedTitle') + (job.error?.code ? ' · ' + job.error.code : ''),
                    ),
                    h('div', { className: 'dsgh-banner-text' }, job.error?.message || t('failedTitle')),
                    h(
                      'div',
                      { className: 'dsgh-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dsgh-btn small',
                          onClick: () =>
                            copyText(
                              (job.error?.message || '') +
                                (job.steps || [])
                                  .map((step) => '\n' + (step.ok ? '✓ ' : '✗ ') + step.label + (step.output ? '\n' + step.output : ''))
                                  .join(''),
                              'error',
                            ),
                        },
                        copied === 'error' ? t('copied') : t('copyError'),
                      ),
                    ),
                  )
                : null,
              done
                ? h(
                    'div',
                    { className: 'dsgh-banner ok' },
                    h('div', { className: 'dsgh-banner-title' }, h('span', null, '✓'), t('doneTitle')),
                    h(
                      'div',
                      { className: 'dsgh-banner-text' },
                      t('account') + ' · ' + (job.result?.login || '') + ' · ' + t('repo') + ' · ' + (job.result?.repo || ''),
                    ),
                    h(
                      'div',
                      { className: 'dsgh-actions' },
                      job.result?.repoUrl
                        ? h(
                            'a',
                            { className: 'dsgh-btn small', href: job.result.repoUrl, target: '_blank', rel: 'noreferrer' },
                            t('nextRepo'),
                          )
                        : null,
                      job.result?.repoUrl
                        ? h(
                            'button',
                            {
                              type: 'button',
                              className: 'dsgh-btn small',
                              onClick: () => copyText(job.result.repoUrl, 'repoUrl'),
                            },
                            copied === 'repoUrl' ? t('copied') : t('copyUrl'),
                          )
                        : null,
                    ),
                  )
                : null,
              (job.steps || []).length
                ? h(
                    'div',
                    { className: 'dsgh-steps' },
                    job.steps.map((step, index) =>
                      h(
                        'div',
                        { className: 'dsgh-step', key: step.label + index },
                        h('span', { className: 'mark ' + (step.ok ? 'ok' : 'bad') }, step.ok ? '✓' : '✗'),
                        h(
                          'span',
                          { className: 'detail' },
                          step.label,
                          step.output
                            ? h('details', null, h('summary', null, t('showOutput')), h('pre', null, String(step.output)))
                            : null,
                        ),
                      ),
                    ),
                  )
                : null,
              done
                ? h(
                    'div',
                    { className: 'dsgh-section' },
                    h('h3', null, t('nextTitle')),
                    h('p', { className: 'dsgh-hint' }, t('nextHint')),
                    h(
                      'div',
                      { className: 'dsgh-links' },
                      h(
                        'a',
                        { className: 'dsgh-btn', href: 'https://www.dsh.so/zh/submit/', target: '_blank', rel: 'noreferrer' },
                        t('nextDshSo'),
                      ),
                      h(
                        'a',
                        { className: 'dsgh-btn', href: 'https://deepseek1024.com/', target: '_blank', rel: 'noreferrer' },
                        t('nextStore'),
                      ),
                    ),
                  )
                : null,
            )
          }

          function repoRows() {
            const shown = showAllRepos ? repos : repos.slice(0, 6)
            return h(
              'div',
              { className: 'dsgh-repos' },
              shown.map((repo) =>
                h(
                  'div',
                  { className: 'dsgh-repo-row', key: repo.id || repo.fullName },
                  h(
                    'div',
                    { className: 'dsgh-repo-main' },
                    h(
                      'div',
                      { className: 'dsgh-repo-name' },
                      h('a', { href: repo.url, target: '_blank', rel: 'noreferrer' }, repo.fullName),
                      h('span', { className: 'dsgh-tag' }, repo.private ? t('privateBadge') : t('publicBadge')),
                      repo.topics?.includes('dsh-plugin') ? h('span', { className: 'dsgh-tag on' }, t('topicBadge')) : null,
                    ),
                    repo.description ? h('div', { className: 'dsgh-repo-desc' }, repo.description) : null,
                    h('div', { className: 'dsgh-repo-meta' }, t('updated') + ' · ' + String(repo.updatedAt || '').slice(0, 10)),
                  ),
                  h(
                    'div',
                    { className: 'dsgh-repo-actions' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsgh-btn small',
                        onClick: () => copyText(repo.url, 'repo-' + repo.fullName),
                      },
                      copied === 'repo-' + repo.fullName ? t('copied') : '⧉',
                    ),
                    h('a', { className: 'dsgh-btn small', href: repo.url, target: '_blank', rel: 'noreferrer' }, t('open')),
                  ),
                ),
              ),
              repos.length > 6
                ? h(
                    'button',
                    { type: 'button', className: 'dsgh-btn', onClick: () => setShowAllRepos((value) => !value) },
                    showAllRepos ? t('showLess') : t('showMore') + ' · ' + repos.length,
                  )
                : null,
            )
          }

          const items = list.items

          return h(
            'div',
            { className: 'dsgh-page' },
            h('style', { key: 'github-publish-style' }, CSS),
            h(
              'div',
              { className: 'dsgh-head' },
              h(
                'div',
                null,
                h('h2', { className: 'dsgh-title' }, t('title')),
                h('p', { className: 'dsgh-sub' }, t('subtitle')),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsgh-btn',
                  onClick: () => {
                    loadList()
                    loadToken()
                    loadRepos()
                  },
                  disabled: list.status === 'loading' || list.status === 'refreshing',
                },
                list.status === 'refreshing' ? t('refreshing') : t('refresh'),
              ),
            ),
            notice ? h('div', { className: 'dsgh-result ' + (notice.kind === 'error' ? 'err' : '') }, notice.text) : null,
            h(
              'section',
              { className: 'dsgh-section' },
              h('h3', null, t('tokenTitle')),
              h(
                'div',
                { className: 'dsgh-token' },
                h(
                  'span',
                  { className: 'dsgh-tag ' + (token.configured ? 'on' : token.available ? 'off' : 'err') },
                  !token.available ? t('tokenUnavailable') : token.configured ? t('tokenSaved') : t('tokenMissing'),
                ),
                h('input', {
                  className: 'dsgh-input',
                  type: 'password',
                  autoComplete: 'off',
                  spellCheck: false,
                  placeholder: t('tokenPlaceholder'),
                  value: draft,
                  disabled: saving || !token.available || !token.writable,
                  onChange: (event) => setDraft(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') saveToken()
                  },
                }),
                h(
                  'button',
                  { type: 'button', className: 'dsgh-btn primary', disabled: saving || !draft.trim(), onClick: saveToken },
                  saving ? t('saving') : t('save'),
                ),
                token.configured
                  ? h('button', { type: 'button', className: 'dsgh-btn danger', disabled: saving, onClick: clearToken }, t('clear'))
                  : null,
                h('a', { className: 'dsgh-btn', href: TOKEN_URL, target: '_blank', rel: 'noreferrer' }, t('tokenLink')),
              ),
              h('p', { className: 'dsgh-hint' }, t('tokenHint')),
            ),
            h(
              'div',
              { className: 'dsgh-grid' },
              h(
                'div',
                { className: 'dsgh-col' },
                h(
                  'section',
                  { className: 'dsgh-section' },
                  h('h3', null, t('checks') + ' · ' + items.length),
                  list.scanRoot
                    ? h('p', { className: 'dsgh-hint' }, t('scanHint') + ' · ' + list.scanRoot + ' · ' + t('scanAuto'))
                    : list.profileDir
                      ? h('p', { className: 'dsgh-hint' }, t('profile') + ' · ' + list.profileDir)
                      : null,
                  list.status === 'loading'
                    ? h('div', { className: 'dsgh-empty' }, t('loading'))
                    : items.length === 0
                      ? h('div', { className: 'dsgh-empty' }, t('empty'))
                      : items.map(card),
                ),
              ),
              h(
                'div',
                { className: 'dsgh-col dsgh-col-right' },
                statusPanel(),
                h(
                  'section',
                  { className: 'dsgh-section' },
                  h(
                    'div',
                    { className: 'dsgh-section-head' },
                    h('h3', null, t('reposTitle') + (repos.length ? ' · ' + repos.length : '')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsgh-btn small',
                        disabled: reposStatus === 'loading' || !token.configured,
                        onClick: () => loadRepos(false),
                      },
                      reposStatus === 'loading' ? t('reposLoading') : t('reposRefresh'),
                    ),
                  ),
                  h(
                    'p',
                    { className: 'dsgh-hint' },
                    t('reposHint') +
                      ' · ' +
                      t('autoRefresh') +
                      (reposAt ? ' · ' + t('updatedLabel') + ' ' + new Date(reposAt).toLocaleTimeString() : ''),
                  ),
                  !token.configured
                    ? h('div', { className: 'dsgh-empty' }, t('reposNeedToken'))
                    : reposStatus === 'loading' && repos.length === 0
                      ? h('div', { className: 'dsgh-empty' }, t('reposLoading'))
                      : reposStatus === 'error'
                        ? h(
                            'div',
                            { className: 'dsgh-result err' },
                            t('reposError') + ': ' + reposError,
                            h('button', { type: 'button', className: 'dsgh-btn', onClick: () => loadRepos(false) }, t('retry')),
                          )
                        : repos.length === 0
                          ? h('div', { className: 'dsgh-empty' }, t('reposEmpty'))
                          : repoRows(),
                ),
              ),
            ),
          )
        }

        ctx.slots.inject('plugins.tab', () =>
          ctx.slots.register(
            {
              name: 'plugins.tab',
              id: 'publish',
              order: 61,
              label: () => t('tab'),
            },
            PublishPage,
          ),
        )
      },
    }
  },
})
