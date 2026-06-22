# Z3R Simulator - Deobfuscated Source (Offline Fork)

A reconstructed TypeScript source tree for **Z3R Simulator**, a tool
for simulating Zelda: A Link to the Past Randomizer runs, originally
published at
  [z3rsim-reborn](https://derpaholicrex.github.io/z3rsim-reborn/) originally by **Kyong92**.

This fork adds **offline/fork functionality** including:
- **Load Spoiler Log** - upload spoiler logs from [alttpr.com](https://alttpr.com/en/randomizer)
- **Generate Seed** - generate new seeds via proxy
- **GitHub Pages support** - SPA redirect (404.html) and dynamic base href
- Convenience scripts for local hosting

## Status

- Full TypeScript source: ~18 components, 5 services, 11 models,
  15 dungeon setups, 2 location datasets, and the `itemLogFilter` pipe
- Builds with zero TypeScript errors against Angular 21.2.14
- Behavioral parity with the original bundle
- **The seed format is pre-2019 ALttPR.** Current seeds from
  [alttpr.com](https://alttpr.com/) will not load - a bundled default
  seed is included so you can still try it out.

## Requirements

- **Node 20+** (Node 22 LTS recommended)
- A static HTTP server (optional - only needed to view a production `dist/` build)

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Run the dev server (Angular CLI) - http://localhost:4200
npm start
```

To produce a static build instead, run `npm run build` and serve the
generated `dist/browser/` folder with any static HTTP server
(e.g. `npx http-server dist/browser`).

## Project Layout

```
src/
  main.ts                 Angular app entry
  polyfills.ts            core-js + zone.js
  index.html              app shell
  styles.css              global styles
  styles/                 bundled CSS and fonts
  tsconfig.json
  app.module.ts           NgModule (18 declarations, 4 providers)
  app-routing.module.ts   routes (/, /standard, /open, /inverted, …)
  environments/           dev + prod
  components/             component folders (.ts + .html + .css each)
  services/               injectables (Game, Seed, SeedParser, ItemNames, WindowRef)
  models/                 typed classes/enums (Items, Config, Location, …)
  dungeons/               dungeon/overworld setup files
  data/                   Light World + Dark World location tables
  pipes/                  itemLogFilter
assets/                   PNGs (item/dungeon/map icons)
hotfix/                   JSON data (item map, location map, spoiler log)
scripts/                  Helper scripts (offline integration, item array generation)
.angular.json             build config
package.json              Angular 21.2.14 deps
404.html                  GitHub Pages SPA redirect
runSite.bat               Windows convenience script
runSite.sh                Unix convenience script
```

Third-party font and icon notices are tracked in `THIRD_PARTY.md`.

The app builds into a self-contained `dist/` that can be served from
any static host.

## Deobfuscation Notes

The reconstruction preserves the original bundle's behavior. The only
intentional deviations, each marked in-file with `// Original:` /
`// Fixed:` comments, are three small bug fixes that would otherwise
cause errors in the reconstructed source.

Variable names are best-guess as the originals have been lost. Should
help in reading the code.

One CSS deviation: `node.component.css` and `tracker-node.component.css`
use `url(/assets/...)` with a leading slash instead of the original
`url(assets/...)`. This is required for Angular CLI's webpack to
resolve asset paths from the project root rather than from each CSS
file.

An added banner on the app homepage notes the pre-2019 seed-format issue.

Everything else matches the original bundle.

## Credits

Original simulator by **Kyong92**.
Join the community at our [Discord](https://discord.gg/s3QNbeqxpD).

This project is built on top of the public site rip preserved by
**DerpaholicRex** at
[github.com/DerpaholicRex/z3rsim_offline](https://github.com/DerpaholicRex/z3rsim_offline)
- huge thanks for keeping the original bundle available so the
community had something to work from.

The game logic mirrors the VT v30 ALttPR ruleset that the original
simulator was built against.

If Kyong would like this repository taken down or updated in any way,
please open an issue and it will be honored.

## Contributing

Please limit contributions to any errors found that don't reflect the
original source code. Any modernization should be copied / forked from
this into its own project.

## License

This repo claims no additional rights over the underlying work.
