# ChangeLog

## v1.0.0

Summary of changes since **v0.3.5** (major toolchain and API refresh).

### Breaking changes

- **Vue 3 only** — drops Vue 2 / `@vue/cli` / Babel app wiring; peer dependency is **Vue 3.x.
- **Build system** — **Vite** library build instead of Vue CLI; consume **`dist/histogram-slider.mjs`** / **`.umd.min.js`** and **`histogram-slider.css`** per `package.json` `exports` (see README).
- **Package manager** — **npm** and **`package-lock.json`** replace Yarn / `yarn.lock`.
- **Ion.RangeSlider asset** — vendored plugin lives as **`src/lib/range-slider.ts`** (ESM-friendly wrapper).

### Added

- **Default range props** — optional **`defaultFrom`** / **`defaultTo`**: set initial selection on the full domain; with **`clip`**, **double-click** on the histogram resets to that default (double needs both; single uses **`defaultFrom`**). If omitted, behaviour matches the previous full-span defaults.
- **TypeScript** across `HistogramSlider`, props, demo app, and **`src/types/jquery-ion-range-slider.d.ts`**.
- **Demo page** (`App.vue`) — multiple cards documenting props (grid, bar width/gap, gradients, default ranges, programmatic `update()`, etc.).
- **`prepare`** script (runs **`build`**) so the package can be installed from **git**.
- **PostCSS** config as **`postcss.config.cjs`** for ESM **`"type": "module"`** compatibility.
- **ESLint 9** flat entrypoint **`eslint.config.js`** (wraps legacy **`.eslintrc.cjs`** via `@eslint/eslintrc` FlatCompat).
- **`scripts/rename-lib-css.mjs`** — normalizes built CSS filename for published **`exports`**.

### Changed

- **Single-handle histogram highlighting** — bins follow the same rule as Ion’s single track (**`x0 < from`**), with the handle starting at the **domain maximum** so the full series is highlighted by default (aligned with “select all” / track fill direction).
- **D3 v3 / brush** — brush **`end`** handler uses **`D3BrushEvent.selection`** (D3 v6+); removes reliance on removed global **`d3-selection` `event`** (fixes bundler warnings).
- **LICENSE** — **`package.json`** **license** field aligned with repository **MIT** (was incorrectly **GPL-3.0** upstream).
- **README** — usage notes for Vue 3, install, and peers.

### Fixed

- **`grid_num`** passed correctly through to Ion.RangeSlider (#27).
- **Brush / clip events** — typo **`form` → `from`** in emitted range payload (#9).
- Various runtime issues addressed in history between tags: **multi-slider**, **`update`**, **jQuery `window`**, **jquery window issue**, **hist** colouring / clip behaviour (see commits on default branch).
- **Removed generate random id** (stable IDs via counter).

### Maintenance

- **Dependabot** — numerous **transitive** dependency bumps (e.g. **lodash**, **elliptic**, **ini**, **url-parse**, **browserslist**, **ws**, **tar**, **dns-packet**, **jquery** 3.5+, **highlight.js**, **http-proxy**, **follow-redirects**, etc.) for security and compatibility while still on the Vue 2 toolchain.
- **Prettier** config added; **MIT** license text / badge clean-up.
- **1.0.0 release commit** — D3, Vite, ESLint, TypeScript, Vue, **`vue-tsc`**, and related dev deps refreshed toward current majors/minors.

## v0.3.5

### New Features
- Added handle size prop

## v0.3.3

### Bug Fix
- Fixed hist color issue

## v0.3.2

### Bug Fix
- Performance improvements

## v0.3.1

### Bug Fix
- Histogram clip issue fixed

## v0.3.0

### New Features
- Add histogram clip

## v0.2.1

### Bug Fix
- First and lash histogram bar color not change problem fixed

## v0.2.0

### New Features
- `min`, `max` props are not required
- `type` 'single' option is completed

## v0.1.0