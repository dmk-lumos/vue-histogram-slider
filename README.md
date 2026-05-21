<p align="center">
    <img src="https://github.com/dmk-lumos/vue-histogram-slider/raw/master/resources/header.png" width="500" alt="Vue Histogram Slider">
</p>
<p align="center">
  Range slider with histogram for <a href="https://vuejs.org/">Vue 3</a>
</p>
<p align="center">
    <a href="https://github.com/dmk-lumos/vue-histogram-slider/blob/master/LICENSE"><img src="https://img.shields.io/github/license/dmk-lumos/vue-histogram-slider?style=flat-square" alt="License" /></a>
    <a href="https://www.npmjs.com/package/vue-histogram-slider"><img alt="npm" src="https://img.shields.io/npm/dm/vue-histogram-slider?style=flat-square"></a>
    <a href="https://github.com/dmk-lumos/vue-histogram-slider/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/dmk-lumos/vue-histogram-slider?style=flat-square"></a>
    <a href="https://www.npmjs.com/package/vue-histogram-slider"><img alt="npm version" src="https://img.shields.io/npm/v/vue-histogram-slider?style=flat-square"></a>
</p>

<hr>

**1.0.0** is the first release from this repo (Vue 3 + TypeScript + Vite). See [CHANGELOG.md](./CHANGELOG.md) for scope and lineage versus older npm 0.x lines.

## Quick start

Try the component in the browser (optional):

<a href="https://codesandbox.io/s/vue-histogram-slider-b7m0e?fontsize=14" target="_blank" rel="noopener noreferrer">
  <img alt="Edit on CodeSandbox" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>

<p align="center">
    <img src="https://github.com/dmk-lumos/vue-histogram-slider/raw/master/resources/histogram-slider-demo.gif" alt="Demo animation">
</p>

## Installation

Requires **Vue 3.4+** as a peer dependency.

```bash
npm install vue-histogram-slider vue
```

## Usage

Register the component and import styles. Prefer the **package export** for CSS so paths stay stable:

```js
import { createApp } from 'vue'
import App from './App.vue'
import HistogramSlider from 'vue-histogram-slider'
import 'vue-histogram-slider/histogram-slider.css'

const app = createApp(App)
app.component(HistogramSlider.name ?? 'HistogramSlider', HistogramSlider)
app.mount('#app')
```

```vue
<HistogramSlider
  v-model="range"
  :width="600"
  :bar-height="100"
  :data="data"
/>
```

### Package entrypoints

| Import | Purpose |
|--------|---------|
| `vue-histogram-slider` | Default export: **HistogramSlider** component; named type exports (see `dist/histogram-slider.d.ts`). |
| `vue-histogram-slider/histogram-slider.css` | Bundled stylesheet for the slider and histogram. |

## Props

Property | Type | Default | Description |
| --- | :---: | :---: | --- |
| `data` | `number[]` | _(required)_ | Values used for the histogram and slider domain when `min` / `max` are omitted. |
| `min` | `number` | `min(data)` | Slider and histogram lower bound. |
| `max` | `number` | `max(data)` | Slider and histogram upper bound. |
| `modelValue` | `{ from, to }` | — | `v-model` range in the same numeric space as the slider. |
| `defaultFrom` | `number` | — | **Double only:** left handle anchor with `defaultTo` (initial + double-click reset). Ignored when `type` is `single`. |
| `defaultTo` | `number` | — | **Double:** right handle anchor (with `defaultFrom`). **Single:** lone handle anchor (see type docs). |
| `clip` | `boolean` | `true` | Brush zoom and double-click full-domain reset on the histogram. |
| `block` | `boolean` | `false` | Disables interaction. |
| `grid` | `boolean` | `true` | Grid ticks on the track. |
| `gridNum` | `number` | `4` | Grid divisions. |
| `step` | `number` | `1` | Step between values. |
| `hideMinMax` | `boolean` | `true` | Hide min/max labels. |
| `hideFromTo` | `boolean` | `false` | Hide from/to labels on handles. |
| `toFixed` | `boolean` | `false` | **Double:** Ion `to_fixed` — locks the **right** handle. **Single:** unused by Ion for the thumb (use `fromFixed`). |
| `fromFixed` | `boolean` | `false` | **Double:** Ion `from_fixed` — locks the **left** handle. **Single:** locks the **only** thumb (Ion still uses `from` / `from_fixed`; this is separate from `defaultTo`). |
| `forceEdges` | `boolean` | `false` | Keep slider inside its container. |
| `dragInterval` | `boolean` | `false` | Drag both handles together (double only). |
| `keyboard` | `boolean` | `true` | Keyboard nudging. |
| `type` | `'double' \| 'single'` | `'double'` | One or two handles. |
| `width` | `number` | `650` | Control width in px. |
| `barHeight` | `number` | `100` | Histogram SVG height in px. |
| `barWidth` | `number` | `6` | Bar column width. |
| `barGap` | `number` | `5` | Gap between bars. |
| `barRadius` | `number` | `4` | Bar corner radius. |
| `prettify` | `function` | — | Format numbers on labels (e.g. dates). |
| `lineHeight` | `number` | `6` | Slider line height in px. |
| `transitionDuration` | `number` | `80` | Bar height tween duration in ms. |
| `primaryColor` | `string` | `'#0091ff'` | Primary UI colour. |
| `labelColor` | `string` | `'#0091ff'` | Label colour. |
| `holderColor` | `string` | `'#dee4ec'` | Track / unselected histogram colour. |
| `handleColor` | `string` | `'#ffffff'` | Handle fill. |
| `gridTextColor` | `string` | `'silver'` | Grid label colour. |
| `fontFamily` | `string` | `'Arial, sans-serif'` | Label font stack. |
| `fontSize` | `number` | `12` | Label font size. |
| `handleSize` | `number` | `26` | Handle diameter in px. |
| `histSliderGap` | `number` | `6` | Gap between histogram and slider. |
| `updateColorOnChange` | `boolean` | `true` | Update bar fill on every live change; set `false` for performance (updates on handle release). |
| `colors` | `string[]` | — | Optional gradient stops along the value axis. |

Full prop and event documentation lives in **`src/lib/histogram-slider.types.ts`** (mirrored in the generated **`.d.ts`**).

## Events and `v-model`

Use **`v-model`** (or `v-model:modelValue`) with `{ from, to }` for two-way range binding.

**Parent → child:** setting `modelValue` calls Ion **`.update()`** only (handles move, bar colors refresh). It does **not** destroy or re-create the slider. While the user is **dragging**, parent `modelValue` writes are **ignored** (Ion is the source of truth until release). Echoed writes after the child’s own `update:modelValue` are ignored to avoid feedback loops. Other updates are **queued** while the chart is rebuilding.

Avoid driving `v-model` from `@range-updated` with transformed values during an active drag, or passing a **new** `:data` array reference on every parent render; use `@range-updated` for commits (filter, fetch) and keep `data` referentially stable until the series actually changes.

**Child → parent:** **`update:modelValue`** fires on live handle drag (preview) and whenever the range **commits** (see **`rangeUpdated`**). Nothing is emitted until the slider is ready after mount/rebuild.

**Ion re-init** (histogram + plugin recreate) happens only on: initial mount, **brush** zoom, **double-click** reset (`clip`), and **`data` / `type`** changes (zoom preserved; deferred until handle release if dragging).

| Name | When it fires |
|------|----------------|
| `update:modelValue` | Live handle drag (`update:modelValue` only), or committed range (brush, `data`/`type` refresh, reset, `update()`). Not during chart rebuild. |
| `dragStart` | **Pointer-down** on Ion controls; blocks parent `v-model` / `data` / `type` from re-initializing Ion until **`dragEnd`**. |
| `dragEnd` | Handle released after drag (`onFinish`). Not brush or double-click. |
| `rangeUpdated` | **Committed** selection: handle release, brush zoom, or `data`/`type` preserve-zoom refresh. Not live drag frames. Not double-click reset. |
| `rangeReset` | **Double-click** restored the full histogram domain (`clip`); selection reset to defaults / full span. |

TypeScript: import **`RangeValues`**, **`HistogramSliderPublicProps`**, **`HistogramSliderEmits`**, and the default component from **`vue-histogram-slider`** (see **`dist/histogram-slider.d.ts`**).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
