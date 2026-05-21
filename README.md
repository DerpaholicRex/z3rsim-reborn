# Z3R Simulator - Deobfuscated Source (Offline Fork)

A reconstructed TypeScript source tree for **Z3R Simulator**, a tool
for simulating Zelda: A Link to the Past Randomizer runs, originally
published at 
[z3rsim.com](https://z3rsim.com/) by
[Kyong92](https://www.twitch.tv/kyong92).

This fork adds **offline/fork functionality** including:
- **Load Spoiler Log** - upload spoiler logs from [alttpr.com](https://alttpr.com/en/randomizer)
- **Generate Seed** - generate new seeds via proxy
- **GitHub Pages support** - SPA redirect (404.html) and dynamic base href
- Convenience scripts for local hosting

## Status

- Full TypeScript source: ~18 components, 5 services, 11 models,
  15 dungeon setups, 2 location datasets, and the `itemLogFilter` pipe
- Builds with zero TypeScript errors against Angular 4.3.6
- Behavioral parity with the original bundle
- **The seed format is pre-2019 ALttPR.** Current seeds from
  [alttpr.com](https://alttpr.com/) will not load - a bundled default
  seed is included so you can still try it out.
- `ng serve` is broken on Node 12+ (the pinned `webpack-dev-server@2`
  depends on Node APIs that were removed). Use `ng build` and serve
  the `dist/` folder with any static HTTP server.

## Requirements

- **Node 8** - pinned in `.nvmrc` (Angular CLI 1.4.10 requires it)
- npm 5.x (ships with Node 8)
- A static HTTP server for viewing the build (Python's `http.server`
  works fine)

## Quick Start (Local)

```bash
# Option A: Build with Angular CLI
nvm install 8
nvm use 8
npm install
npm run build        # build to dist/

# Serve the dist/ folder
cd dist
python3 -m http.server 8000
# Open http://localhost:8000

# Option B: Run directly via convenience script
# (requires dist/ to be built first, or serve the repo root after running the app)
runSite.bat     # Windows
./runSite.sh    # Linux/macOS
```

## Project Layout

```
src/
  main.ts                 bootstrap entry
  polyfills.ts            core-js + zone.js
  index.html              app shell (jQuery + Bootstrap + Font Awesome)
  styles.css              global styles
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
fonts/                    Font Awesome + Hammersmith One
scripts/                  Helper scripts (offline integration, item array generation)
  generateItemArray.js         Maps spoiler log items to the game's item array
  generateSeedMetadataPrefix.js Generates seed metadata prefix from spoiler log
  spoilerLogAdapter.js         Adapter for loading spoiler logs from localStorage/file
  integration.js               DOM integration: navbar buttons, seed generation UI, notifications
.angular-cli.json         build config (copies assets, hotfix, fonts, vendor JS, scripts)
package.json              Angular 4.3.6 deps pinned
.nvmrc                    Node 8
404.html                  GitHub Pages SPA redirect
runSite.bat               Windows convenience script
runSite.sh                Unix convenience script
```

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

Original simulator by **Kyong92** -
[Twitch](https://www.twitch.tv/kyong92) •
[Twitter](https://twitter.com/kyong92) •
[Discord](https://discord.gg/nPJpFQB)

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