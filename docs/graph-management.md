# Knowledge graph management

The active website is `public-site/`, served at `https://yingqicai.vip`. Confirm the actual HTML script URLs and `release.json` commit after publishing. Sites project metadata alone does not establish what a custom domain serves.

## Classification and graph structure

- A paper's `category` is its major category.
- `directions[].papers` is the canonical membership pool for a research direction. Membership alone creates no graph node or edge. Each paper belongs to at most one direction.
- `directions[].categoryId` records the major even for an empty or unplaced direction.
- `directions[].parentPaperId` explicitly attaches a direction beneath a paper.
- `directions[].graphPapers` explicitly attaches selected papers beneath that direction. Unassigned papers are shared candidates within the major; no separate Other graph or classification is created.
- `relations` contains explicit paper-to-paper edges. These and direction attachments share cycle and single-parent validation in `shared/graph-model.mjs`.
- `treeNodes` explicitly includes independent paper nodes. Membership in a direction does not disqualify an otherwise parentless paper from being a root.
- `treeExcludedNodes` controls visibility only. A hidden node's actual edges remain discoverable in the admin's hidden-edge audit and continue to occupy its parent relationship until the user removes or moves them.

The graph renderer and connector measurement code is shared by public and admin views. SVG endpoints are computed from actual node boxes. Relationship labels have a fixed maximum width and unrestricted height. Their row spacing is derived from measured label height, with visible stems before and after the label.

## Compatibility

Read legacy direction membership lists and remove redundant `directionPapers` and paper `researchDirectionId` fields when saving. For old directions without `graphPapers`, migrate their previously displayed placements once, excluding papers that already have an explicit incoming relation. Keep every stored relation, including hidden ones. Later membership edits never infer new placements.

Run `node --test shared/graph-model.test.mjs oauth-service/worker.test.mjs` and `node public-site/build.mjs`. Shared changes trigger both public-site and authorization-service workflows. Browser checks should cover conflict resolution, saving and reopening, membership-only edits, scoped candidate selection, and connector geometry with long labels.

