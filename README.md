# Plugin Market · 发布到 GitHub

在「设置 → 插件」页加一个 **发布** 标签页，把当前 Profile 里以 `link:` / `file:` 安装的本地插件推送成公开 GitHub 仓库，并加上 `dsh-plugin` 话题——1024store 会自动收录这类仓库。

## 它做什么

- 列出 Profile `package.json` 里 `link:` / `file:` 依赖对应的本地插件
- 同时扫描 `<工作区>/plugins` 下的目录：新放进去的插件 15 秒内出现（即使还没安装），标成「未安装」
- 发布前检查：包信息、`dsh.bundle.patch`、README、LICENSE
- 保存 GitHub token 到 DSH 凭据（不写 `.git/config`，不回传浏览器）
- 发布时依次执行：验证账号 → 创建公开仓库 → `git init` / 提交 → 推送 → 设置 `dsh-plugin` 话题
- 每步都有 ✓/✗ 和命令输出；成功后给出仓库、1024store、dsh.so 入口

## 为什么走 GitHub

1024store 是目录，不托管代码。它收录的是**公开 GitHub 仓库**，并且要求仓库里有 `package.json` 的 `dsh.bundle.patch` 和对应的 patch 文件。没有 npm 包时，目录里按“浏览模式”展示（有仓库链接，没有安装命令）。

## 安装

```bash
dsh plugin --profile desktop add ./plugins/dsh-market-publish
```

## Token 权限

classic token 勾 `repo`；fine-grained token 需要 Contents 和 Administration 写权限。token 只用于 `api.github.com` 和 `git push`。
