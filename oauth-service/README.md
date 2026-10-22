# GitHub 资料管理 API（Cloudflare Workers）

静态资料库继续由 GitHub Pages 托管，论文数据仍在 `data/library.json`。此 Worker 仅负责 GitHub OAuth 登录和对该固定 JSON 文件的授权写入；不使用 GPT，不需要自管服务器，也不需要把 `yingqicai.vip` 的 DNS 迁移到 Cloudflare。默认使用 Cloudflare 提供的 `workers.dev` 地址。

## 部署和首次配置

1. 在 Cloudflare 创建账号并启用 Workers 的 `workers.dev` 子域名。仓库中的 `wrangler.toml` 将 Worker 命名为 `yingqi-research-auth`。
2. 在仓库 GitHub Settings → Secrets and variables → Actions 添加：
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID。
   - `CLOUDFLARE_API_TOKEN`：仅授予该账户 Workers Scripts 编辑和账户读取权限的 API Token。不要发到聊天或提交到仓库。
3. 合并包含 `.github/workflows/cloudflare-auth.yml` 的代码后，GitHub Actions 会部署 Worker。若部署凭据还未设置，工作流会明确跳过部署；设置好后可在 Actions 页面手动运行 “Deploy GitHub auth Worker”。实际 Worker 地址会形如 `https://yingqi-research-auth.<你的 workers.dev 子域名>.workers.dev`。
4. 在 Cloudflare Worker Settings → Variables and Secrets 设置：
   - 普通变量 `GITHUB_CLIENT_ID`：GitHub OAuth App 的 Client ID。
   - Secret `GITHUB_CLIENT_SECRET`：OAuth App 的 Client Secret。
   - Secret `SESSION_KEY`：32 字节随机密钥的标准 Base64。

   只在自己的终端生成 `SESSION_KEY`：
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

5. 在 GitHub Settings → Developer settings → OAuth Apps 创建 OAuth App：
   - Homepage URL：`https://yingqicai.vip`
   - Authorization callback URL：填第 3 步实际 Worker 地址后加 `/callback`，例如 `https://yingqi-research-auth.<你的 workers.dev 子域名>.workers.dev/callback`
   - 不启用 Device Flow。

6. 确认 `https://yingqicai.vip` 的 GitHub Pages HTTPS 可正常访问。然后把 `public-site/admin-config.json` 改为：

   `{ "enabled": true, "apiBase": "https://yingqi-research-auth.<你的 workers.dev 子域名>.workers.dev" }`

   将实际 workers.dev 地址写入 `apiBase`，经 PR 合并。该变更会触发 Pages 部署，随后访问 `https://yingqicai.vip/admin.html`。

7. 用 `Aronsoul` 登录，先做一项可撤销的小修改并保存，检查 GitHub Actions 的 Public website 工作流成功，公开资料页面出现更新。

## 安全设计

- OAuth 使用 authorization code + PKCE；Worker 处理回调，校验加密 state cookie，并复核登录用户为 `Aronsoul` 且对目标仓库有 push 权限。
- `workers.dev` 与自定义主站跨站，浏览器可能拦截跨站 Cookie。因此 OAuth 回调把一个 8 小时以内有效的加密会话放在回到管理页的 URL fragment 中；fragment 不会随 HTTP 请求发送。页面立即清除 fragment，只在当前页面内存保留凭证，不写 localStorage、cookie 或 GitHub。
- GitHub 访问令牌只存在于 Worker 加密的会话中。API 每次都复核账号和仓库权限；写接口固定指向 `Aronsoul/yingqi-research-library` 的 `main:data/library.json`，校验 Origin、数据结构和 GitHub 当前 blob SHA，冲突返回 409。
- GitHub OAuth App 的 `public_repo` 授权范围覆盖用户可访问的公开仓库；服务端代码仍将写入目标固定为本项目的单个 JSON 文件。需更严格的 GitHub 侧最小权限时，可另行迁移为 GitHub App。
- 退出管理会清除当前页面内存中的会话；需要撤销 GitHub 授权时，在 GitHub Settings → Applications → Authorized OAuth Apps 撤销该应用。
- 管理入口保持关闭，直到 Worker、OAuth App、主站 HTTPS 和实际 Worker URL 都配置验证完成。绝不要将 OAuth Client Secret、SESSION_KEY 或 Cloudflare API Token 提交到公开仓库。
