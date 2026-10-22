# GitHub 登录与资料写回服务

这是无服务器云函数，不需购买或维护服务器，不使用 GPT。公开资料库仍由 GitHub Pages 托管。

## 部署到 Vercel

1. 用你自己的 Vercel 账号导入 Aronsoul/yingqi-research-library 仓库，Root Directory 选 `oauth-service`，Framework Preset 选 Other，不设置前端构建命令。
2. 在该项目添加域名 `auth.yingqicai.vip`。按 Vercel Domains 页面实际给出的目标，在阿里云添加主机记录 `auth` 的 CNAME。不要修改根域名 @ 的 GitHub Pages A 记录。
3. 在 GitHub Settings → Developer settings → OAuth Apps 注册应用：
   - Homepage URL: https://yingqicai.vip
   - Authorization callback URL: https://auth.yingqicai.vip/callback
   - 不开启 Device Flow。
4. 在 Vercel 项目 Production 环境变量中设置以下五项并重新部署。秘密值只填在 Vercel 中，禁止提交到 GitHub 或发送到聊天中：

| 环境变量 | 内容 |
| --- | --- |
| SITE_ORIGIN | https://yingqicai.vip |
| AUTH_ORIGIN | https://auth.yingqicai.vip |
| GITHUB_CLIENT_ID | OAuth App 的 Client ID |
| GITHUB_CLIENT_SECRET | OAuth App 的 Client Secret（敏感） |
| SESSION_KEY | 32 字节随机密钥的标准 Base64（敏感） |

SESSION_KEY 可在自己的终端运行以下命令生成，然后仅粘贴到 Vercel 环境变量：
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

5. 确认 auth 子域名 HTTPS 正常，访问 `/session` 返回 401（未登录），跨域来源只允许 https://yingqicai.vip。再将 `public-site/admin-config.json` 的 enabled 改为 true 并提交，等待 Pages 发布。
6. 打开 https://yingqicai.vip/admin.html，登录 GitHub，确认账号 Aronsoul，再用一项可撤销的小修改验证：保存生成 GitHub 提交、Public website 工作流成功、公开页面出现更新。

## 权限与会话

使用 OAuth Web Flow + state + PKCE，令牌加密保存在授权服务的 Secure、HttpOnly、SameSite=Lax Cookie，网页 JavaScript 无法读取。最长 8 小时后重新登录。需要主站和 auth 服务处于同一 yingqicai.vip 站点；不要直接把服务换成第三方默认域名，否则浏览器可能拦截跨站 Cookie。

GitHub OAuth 的 `public_repo` 权限会覆盖用户可访问的公开仓库（它不能细分到单个仓库）。本服务固定账号 Aronsoul、仓库 Aronsoul/yingqi-research-library、分支 main、文件 data/library.json；每次请求都会复核当前 GitHub 账号与仓库写权限，不提供任意仓库代理。若今后要求 GitHub 侧也严格限制单仓库，应迁移为 GitHub App。

退出管理会清除本站会话；如需撤销 GitHub 授权，在 GitHub Settings → Applications → Authorized OAuth Apps 中撤销该应用。

## 数据保护

保存必须有有效会话、正确 Origin、有效 JSON 和读取时的 SHA。冲突返回 409，页面保留草稿，不自动覆盖。删除文献会一并移除它的连线与树节点，原始提交可从 GitHub 历史恢复。所有更改只在点击保存并确认后写入；导出草稿不会上传数据。

当前前端默认 enabled=false。缺少云函数或 OAuth 配置时不会显示可用登录入口，也不会假装保存成功。
