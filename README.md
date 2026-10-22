# 知序 · 科研资料库

一个无需访客登录的公开科研资料库，用于整理文献、研究团队、资料与成果，并通过知识图谱查看文献之间的研究脉络。网站以静态页面发布，访客浏览不依赖 GPT API 或自建服务器。

## 在线网站

- 网站：<https://yingqicai.vip>（域名迁移或验证期间，也可从仓库的 **Settings → Pages** 查看 GitHub Pages 地址）
- 源码：public-site/
- 文献与关联数据：data/library.json
- 自动发布：.github/workflows/public-site.yml

## 网站功能

- 按分类、年份和关键词浏览、筛选文献与成果
- 查看文献之间的有向关联、连线说明和年份脉络
- 在知识图谱中以 10%–300% 缩放；指向节点滚动鼠标滚轮，或使用 Ctrl / ⌘ + 滚轮以指针位置为中心缩放
- 浏览研究团队、公开资料和成果
- 通过独立的资料管理页面维护内容；浏览网站无需登录

## 项目结构

| 路径 | 用途 |
| --- | --- |
| data/library.json | 文献、分类、关联、团队、资料和成果的数据 |
| data/assets/ | 网站提供下载的公开附件 |
| public-site/ | GitHub Pages 使用的静态网站和构建脚本 |
| public-site/admin.html | 资料管理页面 |
| oauth-service/ | 资料管理使用的独立 OAuth 服务说明 |
| website/ | 历史应用源码及共享样式；公开网站构建会读取 website/app/globals.css |
| .github/workflows/public-site.yml | 检查数据、构建静态文件并发布到 GitHub Pages |

## 编辑资料

可以在网站的“资料管理”页面通过 GitHub 授权维护内容，也可以直接编辑 data/library.json。

- papers：文献记录。每条需要唯一的 id 和 title，并可包含作者、年份、DOI、文献类型、简介、分类和关键词；网站支持按文献类型筛选。
- relations：文献之间的有向关联。from 指向上级文献，to 指向下级文献，label 说明关系。
- treeNodes：可选的知识图谱根节点文献 ID 列表；未设置时，关联中的文献会自动显示。
- categories：文献分类，可用 parentId 建立层级。
- teams、resources、resourceCategories、projects：研究团队、资料、资料分类和研究成果。

添加关联前，请确认两端文献都存在，并避免循环关系。建议每篇文献只设置一个上级。例如：

~~~json
{
  "id": "relation-1",
  "from": "paper-parent",
  "to": "paper-child",
  "label": "方法改进"
}
~~~

附件会随公开网站发布，访客可以下载。请勿在资料或附件中放入不应公开的信息；单个附件上限为 20 MB。

## 本地构建与预览

需要 Node.js，无需安装项目依赖。在仓库根目录运行：

~~~sh
node public-site/build.mjs
~~~

构建会校验资料数据并生成 public-dist/。请通过本地静态 HTTP 服务预览生成的网站，不要直接双击 HTML 文件。

## 自动检查与发布

向 main 推送对公开网站源码、资料数据、附件、共享样式或工作流的更改时，GitHub Actions 会检查 JavaScript、验证数据并构建网站，然后发布到 GitHub Pages。对拉取请求会运行构建检查；合并到 main 后才发布生产网站。若构建失败，Actions 会显示错误，旧版本网站会继续保留。

首次启用 Pages 时，在仓库 Settings → Pages 中将发布来源设为 GitHub Actions。域名 DNS、HTTPS 和 OAuth 服务需要分别完成配置。资料编辑与部署说明见 [public-site/README.md](public-site/README.md)。
