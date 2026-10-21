# 知序 · 科研资料库

无需登录即可浏览的文献、研究关联树与成果网站。无需自建服务器，网站运行不依赖 GPT。

- 源码：public-site/
- 内容：data/library.json
- 自动部署：.github/workflows/public-site.yml → GitHub Pages
- 自定义域名：yingqicai.vip（迁移中）

[内容编辑和部署说明](public-site/README.md)

编辑 data/library.json 并提交到 main 即可增删资料；修改 public-site/ 可以调整功能。GitHub Actions 自动构建和发布，不需要 GPT 参与。网站只读，只有具有仓库写权限的 GitHub 用户可以更新内容。

website/ 保留旧应用源码供参考，不是当前静态站点入口。
