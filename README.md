# 知序 · 科研资料库

私有科研资料管理网站。GitHub 仓库同时保存网站源码与文献数据。

- `website/`：React / Vinext 网站源码、服务端接口与锁定的依赖。
- `data/library.json`：文献标题、DOI、简介、分类、成果及关联。
- `.github/workflows/website-checks.yml`：网站源码变更的自动构建检查。
- `AGENTS.md`：GPT 修改、提交和发布约定。

## 更新与发布

GPT 在功能分支修改 `website/`，运行类型检查和生产构建，再创建 PR 合并到 `main`。合并事件触发 ChatGPT 自动部署任务，由任务读取 GitHub 主分支源码并部署到原有 owner-private Sites 项目。数据文件变更不触发网站重建。直接 push 主分支不会触发当前 PR 合并事件，源码更新请使用 PR。

自动部署依赖 GitHub 与 Sites 连接和事件任务保持启用。GitHub Actions 只做构建验证，不持有部署密钥。部署结果以 Sites 返回成功为准；失败保留上一版本。

## 本地开发

```sh
cd website
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build
pnpm dev
```

Node.js 24。运行时 GitHub Token 使用网站的安全连接表单或 Sites 服务端密钥配置，不提交进仓库。GitHub 中存储数据并不自动授予网页读写权限；需要单独完成网站授权。

现有站点：https://yingqi-research-library.mauveshark18.chatgpt.site
域名：yingqicai.vip（以 DNS 验证实际状态为准）。
