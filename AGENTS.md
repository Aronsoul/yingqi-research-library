# Repository workflow

Canonical repository: Aronsoul/yingqi-research-library.

The user authorized a public repository and public browsing without GPT login or a self-managed server.

- The active website is public-site/. Build from repository root with `node public-site/build.mjs` (Node 24). Runtime is static HTML/CSS/JS only, no tokens or GPT calls.
- Data is data/library.json. Preserve the user's papers, projects, relations and optional treeNodes. Never replace it with website/app/seed.json.
- Shared visual styles are website/app/globals.css. Other website/ code is a legacy Sites application; do not publish it or restore ChatGPT authentication.
- `.github/workflows/public-site.yml` builds and deploys to GitHub Pages on main code/data changes, without ChatGPT automation.
- Edit on a feature branch, run JS syntax check and public-site build, open a descriptive PR and merge after checks pass for authorized implementation work.
- Do not commit generated public-dist/, credentials, .env, .dev.vars, cookies, node_modules or build logs. All repository history will be publicly readable.
- Data writes happen through authenticated GitHub edits, never unauthenticated writes in the public website.
- Preserve yingqicai.vip. Configure Pages successfully before switching DNS. Do not change domain records speculatively.
- Report source/PR, checks, deployment and domain status truthfully. A committed workflow is not a verified deployment.
