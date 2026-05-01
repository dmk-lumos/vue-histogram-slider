# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 1.0.0 — 2026-04-30

First stable release of **vue-histogram-slider** from this repository: **Vue 3** component, TypeScript types, Vite library build, and documented public API.

### Added

- **HistogramSlider** — range control with D3 histogram, optional **brush zoom** and **double-click** full-domain reset when **`clip`** is enabled.
- **`v-model` / `modelValue`** — two-way `{ from, to }` in the same numeric space as **`data`** (and optional **`min`** / **`max`**).
- **Events** — **`dragStart`** / **`dragEnd`** (Ion.RangeSlider handle lifecycle), **`rangeUpdated`** (handle commit or brush zoom), **`rangeReset`** (double-click restores full domain). Live values use **`update:modelValue`**.
- **Defaults / reset anchors** — **`defaultFrom`** + **`defaultTo`** for **double** sliders; **`defaultTo`** alone anchors the **single** handle (initial + double-click reset). **`defaultFrom` is ignored when `type` is `single`** (use **`defaultTo`** instead). See type JSDoc.
- **TypeScript** — published **`dist/histogram-slider.d.ts`** with **`RangeValues`**, **`HistogramSliderPublicProps`**, **`HistogramSliderEmits`**; re-exported from the package entry.
- **Build & packaging** — Vite ESM (`.mjs`) and UMD bundles, **`exports`** map (including **`vue-histogram-slider/histogram-slider.css`**), **`prepare`** runs **`build`** for git installs.
- **Demo** — `App.vue` gallery covering props, gradients, programmatic **`update()`**, and event logging.

### Technical notes

- **Ion.RangeSlider** is vendored for ESM (`src/lib/range-slider.ts`) with **jQuery** as a runtime dependency.
- **D3** v6+ modules for scales, bins, brush, and transitions; brush uses **`D3BrushEvent.selection`** (no legacy global `d3.event`).
- **ESLint 9** flat config, **vue-tsc** typecheck, **Prettier**-compatible formatting.

### Lineage

Earlier **0.x** releases on npm under the name **`vue-histogram-slider`** came from a different repository and stack (Vue 2). **1.0.0** is the first release from **[dmk-lumos/vue-histogram-slider](https://github.com/dmk-lumos/vue-histogram-slider)**; treat it as a new baseline, not a drop-in continuation of those tags.
