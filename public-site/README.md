# 独立静态网站

网站无访客登录、无 GPT API、无运行时密钥。GitHub Pages 托管发布产物；文献、分类、树状关联、研究成果和资料库均由 GitHub 仓库存储，访客可浏览。站长使用独立 OAuth Worker 管理资料。资料链接和上传文件都可分类；上传文件保存在公开仓库的数据附件目录中并发布供下载，单个文件最大 8 MB。

## 修改内容

优先在网站“资料管理”中使用 GitHub 授权通过表单维护；也可直接编辑 data/library.json：

- `papers`：文献数组。每条包含唯一 `id`、`title`、`doi`、`date`、`category`、`authors`、`summary` 等字段。
- `projects`：成果数组，使用 `title`、`url`、`summary`、`date`、`category`。
- `treeNodes`（可选）：显示在树中的文献 id 数组。
- `relations`：关联数组，每条包含唯一 `id`、`from`（父文献 id）、`to`（子文献 id）、`label`（连线说明）。
- `resources`：资料库条目，支持外部链接和上传文件。
- `resourceCategories`：可自行创建的资料分类，支持子分类。
- 年份字段可以手动输入，也可从候选年份中选择。
- 前台仅提供站内搜索，不再进行联网检索。

增添文献：在 papers 中复制一条对象，换一个唯一 id 并填写资料。删除文献：删除对应对象，同时删除指向它的 relations 和 treeNodes 引用。树状图根据 relations 中的 parent → child 关系生成，并显示每条连线的 label。可在网页管理中添加、编辑和删除关联。

示例关联（请把 id 换成已有文献的真实 id）：
```json
{"id":"relation-1","from":"paper-parent","to":"paper-child","label":"方法改进"}
```

只添加独立根节点时，在顶层加入 `"treeNodes":["paper-parent"]`。不写 treeNodes 时，relations 中出现的文献也会自动展示。建议每篇文献仅有一个上级，不建立循环。

保存为有效 JSON 后点击 Commit changes。GitHub Actions 的 Public website 自动检查、构建、发布。失败时保留旧网站，可在 Actions 中查看错误。访客没有数据写入权限。

## 本地构建

仓库根目录运行 `node public-site/build.mjs`。仅需 Node.js，无需安装依赖，生成 public-dist/。在静态 HTTP 服务下预览（不要直接双击 HTML）。

## 启用 Pages 和域名

仓库需公开（或账号具备私有 Pages 权限）。Settings → Pages → Source 选 GitHub Actions。Custom domain 设置 yingqicai.vip 并等待 DNS 验证，启用 Enforce HTTPS。

迁移时阿里云根域名的 A 记录应替换成 GitHub Pages 指定地址；未确认目标已发布前不要切换，以免中断现有站点。

旧 website/ 是历史 Sites 应用，不参与公共站点构建，不能再部署其中的带登录版本。

## 网页管理

admin.html：GitHub 授权后可以通过表单增删文献、成果、文献关联、资料链接/附件及其分类，再提交到仓库。先按 [授权服务部署说明](../oauth-service/README.md) 部署无服务器云函数并配置 OAuth App。配置完成前 enabled=false，网页不显示可用登录按钮。公众浏览不需要登录。
