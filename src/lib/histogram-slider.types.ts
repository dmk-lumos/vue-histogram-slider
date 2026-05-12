/**
 * Current slider selection in the same numeric space as {@link HistogramSliderPublicProps.data}
 * (e.g. unix ms for timestamps). Ion.RangeSlider exposes this as `from` / `to`.
 */
export type RangeValues = { from: number; to: number }

/**
 * Public props for {@link HistogramSlider} (documentation mirror of runtime `props.ts`).
 * Use with `ComponentProps<typeof HistogramSlider>` in apps, or as reference for `v-model`.
 */
export interface HistogramSliderPublicProps {
  /**
   * Required series used for the histogram bins and slider domain when {@link min} / {@link max}
   * are omitted.
   */
  data: number[]

  /** Optional lower bound of the slider and histogram; defaults to `min(data)`. */
  min?: number

  /** Optional upper bound; defaults to `max(data)`. */
  max?: number

  /**
   * **Anchor for the left handle** (`from`) when using a **double** slider and for **reset**
   * behaviour (see {@link defaultTo}).
   *
   * - **Double slider:** use together with {@link defaultTo}. When both are set, they define the
   *   **initial** `from` / `to` on the **full** data span and the selection **after double‑click**
   * zoom reset (with {@link clip} enabled), i.e. the “home” range users return to.
   * - **Single slider:** ignored; use {@link defaultTo} for the lone handle anchor.
   *
   * If omitted (or for double, if {@link defaultTo} is omitted), the library uses its built‑in
   * defaults (full span or single‑handle rules).
   */
  defaultFrom?: number

  /**
   * **Anchor for the right handle** (`to`) on a **double** slider, or the **single** handle value
   * (still stored as Ion’s `from` internally, with `to` at domain max).
   *
   * - **Double:** must be set together with {@link defaultFrom}. Defines the initial / double‑click
   *   “home” band on the full timeline (with {@link clip}).
   * - **Single:** when set, clamps that value into the current domain for the initial thumb position
   *   and after **double‑click** reset to the full span. If omitted, the thumb starts at the domain
   *   maximum (“select all” / full highlight per Ion’s single track).
   */
  defaultTo?: number

  /**
   * Two‑way binding for the current range (`from` / `to`). Emitted as `update:modelValue` when the
   * user drags, brushes, double‑clicks to reset, or when the instance `update()` method runs.
   * Not emitted on the very first paint before the slider is ready (avoids spurious parent updates).
   */
  modelValue?: RangeValues

  /** When true, brush zoom and double‑click reset are enabled on the histogram. Default: `true`. */
  clip?: boolean

  /** Disables the Ion.RangeSlider interaction. Default: `false`. */
  block?: boolean

  /** Show grid ticks on the track. Default: `true`. */
  grid?: boolean

  /** Number of grid divisions. Default: `4`. */
  gridNum?: number

  /** Step between valid values. Default: `1`. */
  step?: number

  /** Hide min/max labels. Default: `true`. */
  hideMinMax?: boolean

  /** Hide floating from/to labels on handles. Default: `false`. */
  hideFromTo?: boolean

  /**
   * Passed through as Ion **`to_fixed`**: locks the **right** handle on a **double** slider only.
   * On **`type: 'single'`**, Ion does not use `to_fixed` for the lone thumb (use {@link fromFixed}).
   * Default: `false`.
   */
  toFixed?: boolean

  /**
   * Passed through as Ion **`from_fixed`**: locks the **left** handle on a **double** slider, or the
   * **single** thumb (Ion still exposes the value as `result.from`). Not the same prop as
   * {@link defaultTo} (defaults vs drag lock). Default: `false`.
   */
  fromFixed?: boolean

  /** Keep handles inside the track container. Default: `false`. */
  forceEdges?: boolean

  /** Drag both handles together (double only). Default: `false`. */
  dragInterval?: boolean

  /** Keyboard nudging. Default: `true`. */
  keyboard?: boolean

  /** `double` (two handles) or `single`. Default: `'double'`. */
  type?: 'double' | 'single'

  /** Total control width in px. Default: `650`. */
  width?: number

  /** Histogram SVG height in px. Default: `100`. */
  barHeight?: number

  /** Histogram bar column width. Default: `6`. */
  barWidth?: number

  /** Gap between histogram bars. Default: `5`. */
  barGap?: number

  /** Corner radius of bars. Default: `4`. */
  barRadius?: number

  /** Format numbers shown on labels (e.g. dates). */
  prettify?: (value: number) => string

  /** CSS colour for labels. */
  labelColor?: string

  /** Primary UI colour. */
  primaryColor?: string

  /** Track / “unselected” histogram colour. */
  holderColor?: string

  /** Handle fill colour. */
  handleColor?: string

  /** Grid label colour. */
  gridTextColor?: string

  /** Slider line height in px. */
  lineHeight?: number

  /** Bar height tween duration in ms. */
  transitionDuration?: number

  /** Font stack for labels. */
  fontFamily?: string

  /** Font size for labels. */
  fontSize?: number

  /** Vertical gap between histogram and slider in px. */
  histSliderGap?: number

  /** Stops for the linear colour scale along the value axis. */
  colors?: string[]

  /**
   * When true, bar fills update on every Ion live `change`. When false, fills refresh only when the
   * Ion handle interaction ends (`onFinish`). Default: `true`.
   */
  updateColorOnChange?: boolean

  /** Handle diameter in px. */
  handleSize?: number
}

/**
 * Emitted custom events for the default export component (templates use kebab-case:
 * `@update:model-value`, `@drag-start`, `@drag-end`, `@range-updated`, `@range-reset`).
 *
 * **`dragStart` / `dragEnd`** — **`dragStart`** emits the **`PointerEvent`** from **pointer-down** on Ion’s
 * interactive surface (handles, labels, line, bar, shadows). **`dragEnd`** emits **`(event, values)`**:
 * the matching **`pointerup`** `PointerEvent` when available, otherwise a synthetic **`PointerEvent`**
 * (type **`finish`**) for keyboard **`onFinish`** without a prior handle press. They do **not** fire for histogram **brush** zoom or
 * **double‑click** domain reset. Live values use **`update:modelValue`** (Ion `onChange`). Keyboard
 * nudges may call **`onFinish`** without a preceding **`dragStart`** (Ion never signals a real “press” for keys).
 *
 * **`rangeUpdated`** fires when the **selection** settles after a **handle** release (with `dragEnd`)
 * or after **brush** zoom into a narrower domain. It does **not** fire on double‑click full-domain
 * reset — use **`rangeReset`** for that so listeners can treat zoom-home vs in-domain changes
 * separately (same {@link RangeValues} payload shape for both).
 *
 * **`rangeReset`** fires only after **double‑click** on the histogram restores the **full** data
 * domain (requires {@link HistogramSliderPublicProps.clip}). Imperative `update()` updates
 * `modelValue` only and does **not** emit `rangeUpdated` or `rangeReset`.
 */
export interface HistogramSliderEmits {
  'update:modelValue': RangeValues
  dragStart: PointerEvent
  dragEnd: [PointerEvent, RangeValues]
  rangeUpdated: RangeValues
  rangeReset: RangeValues
}
