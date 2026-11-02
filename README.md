# Plugin Market · 发布到 GitHub

在「设置 → 插件」页加一个 **发布** 标签页，把当前 Profile 里以 `link:` / `file:` 安装的本地插件推送成公开 GitHub 仓库、把包发到 npm、再加上 `dsh-plugin` 话题——1024store 会自动收录这类仓库，并因为 npm 上真的有包而给出安装命令。

## 它做什么

- 列出 Profile `package.json` 里 `link:` / `file:` 依赖对应的本地插件
- 同时扫描 `<工作区>/plugins` 下的目录：新放进去的插件 15 秒内出现（即使还没安装），标成「未安装」
- 发布前检查：包信息、`dsh.bundle.patch`、README、LICENSE、**npm 可发布性**
- 保存 GitHub token 和 npm token 到 DSH 凭据（不写 `.git/config`、不写插件目录里的 `.npmrc`，不回传浏览器）
- 「发布并上架」一条龙：验证账号 → 创建公开仓库 → `git init` / 提交 → 推送 → 设置 `dsh-plugin` 话题 → **`pnpm publish` 发 npm** → 校验 registry → 向 1024store 目录开 PR
- 也可以只发 GitHub（`skipNpm` / `skipStore`），或对已有仓库「推送并更新 npm」
- 每步都有 ✓/✗ 和命令输出；成功后给出仓库、npm 页面、目录 PR 入口

## npm 发布

npm 包名直接来自插件 `package.json` 的 `name`——1024store 就是拿它去 registry 查，查不到就只显示「尚未发布 npm 包」。

- 名字必须能发：不能有 `private: true`，不能是 `@local/` 这种你占不到的 scope，只能是合法 npm 名
- 版本号发出去不能撤销；同版本已在 registry 时会自动跳过（不会报错）
- 用宿主自带的 node + pnpm 运行，**不需要全局安装 Node**
- token 用 npmjs.com 的 **Automation** token；运行时写进临时 `.npmrc` 并在发布结束后删除，不会进仓库
- 发布前会用 token 调 `/-/whoami` 校验；scope 与账号不一致时会提示需要组织成员身份

## 为什么走 GitHub

1024store 是目录，不托管代码。它收录的是**公开 GitHub 仓库**，并且要求仓库里有 `package.json` 的 `dsh.bundle.patch` 和对应的 patch 文件。没有 npm 包时，目录里按“浏览模式”展示（有仓库链接，没有安装命令）。

## 安装

```bash
dsh plugin --profile desktop add ./plugins/dsh-market-publish
```

## Token 权限

GitHub：classic token 勾 `repo`；fine-grained token 需要 Contents 和 Administration 写权限。只用于 `api.github.com` 和 `git push`。

npm：`Access Tokens → Generate New Token → Automation`。只用于 `registry.npmjs.org`（`pnpm publish` 和版本校验），不会写进仓库文件。
