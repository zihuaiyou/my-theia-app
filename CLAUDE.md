# Project Map

_git_ref: ad1a07c4f22bbd74812dd39323e00ef0fedbe4da

## Tech Stack
- Framework: Eclipse Theia 1.71.1 (IDE platform)
- Language: TypeScript 5.4.5 + React
- DI: Inversify (Theia DI)
- Build: Webpack + Lerna 2.4.0 (monorepo)
- PM: npm workspaces
- Target: Browser + Electron 39.8.7

## Directory Structure
```
tree-widget/         # Custom Theia extension — React file tree
├── src/browser/
│   ├── file-tree/   # React components, hooks, context menus
│   ├── styles/      # Widget CSS
│   ├── react-tree-widget.tsx     ← Main widget class
│   └── react-tree-startup-contribution.ts  ← View registration
browser-app/         # Theia browser target (localhost:3000)
electron-app/        # Theia Electron target
mcp/project-map-server/  # MCP server: scan_structure, analyze_key_files, detect_stack
docs/                # Learning guides & plugin design specs
.superpowers/sdd/    # SDD task/review evidence
```

## Registration Pattern
- `tree-widget/package.json` → `"theiaExtensions": [{"frontend": "lib/browser/tree-widget-frontend-module"}]`
- Frontend module binds `ReactTreeWidget` + `MyViewContribution` via `ContainerModule`
- Widget ID: `react-tree-widget`, default area: `left` (but moved to right in recent commit)

## Conventions
- Theia DI: `@injectable()`, `ContainerModule`, `bindViewContribution()` for view registration
- React components in `file-tree/`: PascalCase, one component per file
- Custom hooks prefixed `use` (e.g. `useFileTree`)
- SVG icons as React components in `icons.tsx`
- CSS files in `styles/` directory
- MCP server: ESM, Node16 module resolution, Zod schemas for request handlers

## Key Files
- `tree-widget/src/browser/react-tree-widget.tsx` — Main ReactWidget, renders FileTreeComponent
- `tree-widget/src/browser/file-tree/use-file-tree.ts` — State hook: load, CRUD, select, context menu
- `tree-widget/src/browser/file-tree/types.ts` — All TypeScript interfaces (FileTreeNode, props)
- `tree-widget/src/browser/tree-widget-frontend-module.ts` — DI container binding
- `mcp/project-map-server/src/index.ts` — MCP server with 4 tools
