# Repository workflow

Canonical repository: Aronsoul/yingqi-research-library (private).

## Source and data
- Website source is in website/. Data is data/library.json.
- Preserve all existing literature, projects, relations and GitHub history. Never replace live data with website/app/seed.json during a code update.
- Do not commit tokens, cookies, .env files, .dev.vars, .sites-runtime, node_modules or build output.
- Keep the existing owner-only access and Site project_id appgprj_6ad8cbd6d8d88191b4d58d2e1968ec8b. Never create a replacement Site or make it public to deploy.

## Requested website changes
- Read the latest GitHub main branch before editing; source under website/ is authoritative.
- Make the requested edits on a new feature branch.
- In website/, install locked dependencies if needed; run pnpm exec tsc --noEmit and pnpm build. Fix failures before merging.
- Open a descriptive PR with relevant validation. For user-authorized implementation work, merge the completed PR after checks pass unless the user requested review-only or no merge.
- PR merge triggers the ChatGPT automatic deployment task. Do not create a second deployment if that task is already publishing the same source tree.
- Without a working automatic task, use the Sites skill to open the existing project, copy the exact GitHub website/ source state into its checkout, run checks/build, save and deploy owner-private. Use supported native tools and short-lived source credentials, never browser cookies.
- Record the deployed GitHub website subtree SHA in .openai/github-source.json in the Sites checkout only. Do not mirror that generated provenance marker back into website/.
- Report separately: GitHub commit/PR state, build checks, deployment state, runtime GitHub data connection, and domain verification. Never say a commit was deployed without a successful deployment result.
