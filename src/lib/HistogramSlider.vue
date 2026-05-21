<template>
  <div :style="style" class="vue-histogram-slider-wrapper">
    <svg :id="id" class="vue-histogram-view">
      <defs>
        <clipPath :id="clipId">
          <rect :width="Math.max(0, width - 20)" :height="barHeight" x="0" y="0" />
        </clipPath>
      </defs>
    </svg>
    <div class="slider-wrapper">
      <input type="text" :id="histogramId" :name="histogramId" value="" />
    </div>
  </div>
</template>

<script lang="ts">
import $ from 'jquery'
import './range-slider'
import { defineComponent } from 'vue'
import props from './props'
import type { Selection } from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Array from 'd3-array'
import * as d3Select from 'd3-selection'
import 'd3-transition'
import * as d3Brush from 'd3-brush'
import type { D3BrushEvent } from 'd3-brush'
import type { RangeValues } from './histogram-slider.types'

let nextHistogramSliderUid = 0

function clampSelection(from: number, to: number, lo: number, hi: number): RangeValues {
  let f = Math.min(Math.max(from, lo), hi)
  let t = Math.min(Math.max(to, lo), hi)
  if (f > t) {
    const swap = f
    f = t
    t = swap
  }
  return { from: f, to: t }
}

/** Clamp handles into the current zoom window; single mode keeps `to` at the view max. */
function clampRangeToView(val: RangeValues, lo: number, hi: number, single: boolean): RangeValues {
  if (single) {
    return { from: Math.min(Math.max(val.from, lo), hi), to: hi }
  }
  return clampSelection(val.from, val.to, lo, hi)
}

/** Ion `onFinish` without a matching handle `pointerup` (e.g. keyboard-only). */
function syntheticFinishPointerEvent(): PointerEvent {
  return new PointerEvent('finish', {
    bubbles: false,
    cancelable: false,
    pointerId: -1,
    pointerType: '',
    clientX: 0,
    clientY: 0
  })
}

/** Prefer browser `PointerEvent` from jQuery; rare fallbacks use a minimal synthetic. */
function coerceSliderPointerDown(e: JQuery.TriggeredEvent): PointerEvent {
  const oe = e.originalEvent
  if (oe instanceof PointerEvent) return oe
  const me = e as unknown as MouseEvent
  return new PointerEvent('pointerdown', {
    bubbles: e.bubbles,
    cancelable: e.cancelable,
    pointerId: 0,
    pointerType: 'mouse',
    clientX: typeof me.clientX === 'number' ? me.clientX : 0,
    clientY: typeof me.clientY === 'number' ? me.clientY : 0
  })
}

function coercePointerUp(up: Event): PointerEvent {
  if (up instanceof PointerEvent) return up
  return new PointerEvent('pointerup', {
    bubbles: false,
    cancelable: false,
    pointerId: -1,
    pointerType: '',
    clientX: 0,
    clientY: 0
  })
}

type BinDatum = { x0: number; length: number }

/** Root SVG we draw the histogram into (parent in the DOM is HTML). */
type SvgChartSelection = Selection<SVGSVGElement, unknown, HTMLElement, unknown>
/** Histogram `<g>` and the inner `<g>` that only holds bar rects. */
type SvgGroupSelection = Selection<SVGGElement, unknown, HTMLElement, unknown>

/** jQuery + Ion.RangeSlider plugin (avoid relying on fragile module augmentation in SFCs). */
type JQueryIonRange = JQuery<HTMLElement> & {
  ionRangeSlider(_options?: Record<string, unknown>): JQuery<HTMLElement>
}

/** Narrow Ion.RangeSlider instance API without leaking path-dependent types into published `.d.ts`. */
type IonRangeHandle = {
  destroy(): void
  update(opts: { from?: number; to?: number }): void
  readonly result: { from: number; to: number }
}

export default defineComponent({
  name: 'HistogramSlider',

  props,

  emits: {
    'update:modelValue': (_v: RangeValues) => true,
    /** User pressed a handle (or drag-interval bar); pairs with `dragEnd` / Ion `onFinish`. */
    dragStart: (_e: PointerEvent) => true,
    /** Ion.RangeSlider `onFinish`: `(pointerup | synthetic finish, range values)`. */
    dragEnd: (_e: PointerEvent, _v: RangeValues) => true,
    /** Selection settled after handle release or brush zoom (not full-domain double-click reset). */
    rangeUpdated: (_v: RangeValues) => true,
    /** Full histogram domain restored via double-click (with `clip`); selection reset to defaults / full span. */
    rangeReset: (_v: RangeValues) => true
  },

  data(): {
    id: string
    histogramId: string
    clipId: string
    ionRangeSlider: IonRangeHandle | null
    histSlider: unknown | null
    updateBarColor: ((_range: RangeValues) => void) | null
    /** When true, Ion `onChange` / `onFinish` sync `v-model` (skips spurious initial plugin callbacks). */
    emitReady: boolean
    /** Next `pointerup` after handle press, consumed by Ion `onFinish` for `dragEnd`’s event arg. */
    ionDragFinishEvent: PointerEvent | null
    ionDragFinishPointerUpHandler: EventListener | null
    /** Set in `mounted`: redraw while keeping `x` zoom domain and clamping handles into view. */
    chartPreserveZoomRedraw: (() => void) | null
    /** True from handle `pointerdown` until Ion `onFinish` (blocks external re-inits). */
    handleInteractionActive: boolean
    /** `data` / `type` last baked into a histogram rebuild (staleness → preserve-zoom redraw). */
    chartSyncedData: number[] | null
    chartSyncedType: 'double' | 'single' | null
    /** Deferred parent `modelValue` / `update()` while dragging or rebuilding. */
    pendingExternalModelValue: RangeValues | null
    /** Selection to commit after a preserve-zoom rebuild (`emitReady` only). */
    pendingPreserveCommit: RangeValues | null
    /** Selection to commit after brush zoom rebuild (`emitReady` only). */
    pendingBrushCommit: boolean
  } {
    const uid = ++nextHistogramSliderUid
    return {
      id: `vue-histogram-${uid}`,
      histogramId: `histogram-slider-${uid}`,
      clipId: `clip-${uid}`,
      ionRangeSlider: null,
      histSlider: null,
      updateBarColor: null,
      emitReady: false,
      ionDragFinishEvent: null,
      ionDragFinishPointerUpHandler: null,
      chartPreserveZoomRedraw: null,
      handleInteractionActive: false,
      chartSyncedData: null,
      chartSyncedType: null,
      pendingExternalModelValue: null,
      pendingPreserveCommit: null,
      pendingBrushCommit: false
    }
  },

  computed: {
    style(): string {
      return `
        width: ${this.width}px;
        --primary-color: ${this.primaryColor};
        --label-color: ${this.labelColor};
        --holder-color: ${this.holderColor};
        --handle-color: ${this.handleColor};
        --grid-text-color: ${this.gridTextColor};
        --line-height: ${this.lineHeight}px;
        --font-family: ${this.fontFamily};
        --font-size: ${this.fontSize};
        --hist-slider-gap: ${-36 + this.histSliderGap}px;
        --handle-size: ${this.handleSize}px;
      `
    }
  },

  watch: {
    data: {
      handler() {
        this.requestPreserveZoomRedraw()
      }
    },
    type() {
      this.requestPreserveZoomRedraw()
    },
    modelValue: {
      deep: true,
      handler(next?: RangeValues) {
        if (!next) return
        this.applyExternalModelValue(next)
      }
    }
  },

  methods: {
    chartPropsStale(): boolean {
      return this.data !== this.chartSyncedData || this.type !== this.chartSyncedType
    },
    /**
     * `data` / `type` preserve-zoom redraw when props differ from the last rebuild.
     * Skipped while dragging (`handleInteractionActive`) or rebuilding (`!emitReady`); fulfilled after.
     */
    tryFulfillPreserveZoomRedraw() {
      if (!this.chartPreserveZoomRedraw || this.handleInteractionActive || !this.emitReady) return
      if (!this.chartPropsStale()) return
      this.chartPreserveZoomRedraw()
    },
    requestPreserveZoomRedraw() {
      this.tryFulfillPreserveZoomRedraw()
    },
    /**
     * Parent `v-model` or `update()`: Ion `.update()` only — never destroys/recreates the plugin.
     * Queued while the user is dragging or the chart is rebuilding.
     */
    applyExternalModelValue(next: RangeValues) {
      if (!this.ionRangeSlider) return
      if (this.handleInteractionActive || !this.emitReady) {
        this.pendingExternalModelValue = { ...next }
        return
      }
      const cur = this.ionRangeSlider.result
      if (cur.from === next.from && cur.to === next.to) return
      this.ionRangeSlider.update({ from: next.from, to: next.to })
      this.updateBarColor?.(next)
    },
    flushDeferredUpdates() {
      if (this.handleInteractionActive) return
      if (this.pendingExternalModelValue) {
        const next = this.pendingExternalModelValue
        this.pendingExternalModelValue = null
        this.applyExternalModelValue(next)
      }
      this.tryFulfillPreserveZoomRedraw()
    },
    update({ from, to }: RangeValues) {
      if (!this.ionRangeSlider) return
      if (this.handleInteractionActive || !this.emitReady) {
        this.pendingExternalModelValue = { from, to }
        return
      }
      this.ionRangeSlider.update({ from, to })
      this.updateBarColor?.({ from, to })
      this.$emit('update:modelValue', { from, to })
    },
    /** Live `v-model` during handle drag only (`update:modelValue`, no `rangeUpdated`). */
    onSliderLive(val: RangeValues) {
      if (!this.emitReady) return
      const mv = this.modelValue
      if (mv && mv.from === val.from && mv.to === val.to) return
      this.$emit('update:modelValue', { ...val })
    },
    /** After rebuild or clamp: sync `v-model` when needed, always emit `rangeUpdated`. */
    commitSelection(val: RangeValues) {
      if (!this.emitReady) return
      const payload = { ...val }
      const mv = this.modelValue
      if (!mv || mv.from !== payload.from || mv.to !== payload.to) {
        this.$emit('update:modelValue', payload)
      }
      this.$emit('rangeUpdated', payload)
    },
    /** Ion `onFinish`: sync `v-model`, then `dragEnd` + `rangeUpdated` (handle interaction only). */
    onIonHandleFinish(val: RangeValues) {
      if (!this.emitReady) return
      this.handleInteractionActive = false
      this.onSliderLive(val)
      const payload = { ...val }
      const finishEv = this.ionDragFinishEvent ?? syntheticFinishPointerEvent()
      this.ionDragFinishEvent = null
      this.$emit('dragEnd', finishEv, payload)
      this.commitSelection(payload)
      this.flushDeferredUpdates()
    },
    /** Double-click cleared zoom to full data domain; emits `rangeReset` (not `rangeUpdated`). */
    emitRangeReset(val: RangeValues) {
      if (!this.emitReady) return
      this.$emit('rangeReset', { ...val })
    },
    /** Drop capture-phase `pointerup` on `document` (survives Ion DOM removal). */
    clearIonDragCapture() {
      if (this.ionDragFinishPointerUpHandler) {
        document.removeEventListener('pointerup', this.ionDragFinishPointerUpHandler, true)
        this.ionDragFinishPointerUpHandler = null
      }
      this.ionDragFinishEvent = null
    },
    /**
     * Ion 2.3.1’s `onStart` runs only on first `init`, not on user press — delegate `pointerdown` on the
     * slider surface so `dragStart` pairs with Ion `onFinish` / `dragEnd` (handles, labels, line, bar, shadows).
     */
    bindIonDragStartEmitter() {
      const $input = $(`#${this.histogramId}`) as JQuery<HTMLElement>
      const $irs = $input.prev('.irs')
      $irs.off('.vueHistSliderDrag')
      if (!$irs.length || !this.ionRangeSlider) return

      const selectorParts = [
        '.irs-handle',
        '.irs-from',
        '.irs-to',
        '.irs-single',
        '.irs-line',
        '.irs-bar',
        '.irs-shadow'
      ]
      const selector = selectorParts.join(', ')

      $irs.on(`pointerdown.vueHistSliderDrag`, selector, (e: JQuery.TriggeredEvent) => {
        if (!this.emitReady || !this.ionRangeSlider) return
        const pe = e.originalEvent
        if (pe instanceof PointerEvent && pe.pointerType === 'mouse' && pe.button === 2) return
        this.clearIonDragCapture()
        this.handleInteractionActive = true
        const domEv = coerceSliderPointerDown(e)
        this.$emit('dragStart', domEv)
        const onUp: EventListener = (up) => {
          document.removeEventListener('pointerup', onUp, true)
          this.ionDragFinishPointerUpHandler = null
          this.ionDragFinishEvent = coercePointerUp(up)
        }
        this.ionDragFinishPointerUpHandler = onUp
        document.addEventListener('pointerup', onUp, true)
      })
    }
  },

  mounted() {
    const width = this.width - 20

    /** Current `data` series; refreshed from props on every histogram rebuild. */
    let series: number[] = this.data ?? []
    /** Full-span extent from props + `data` (double-click reset target); updated when `data` changes. */
    let fullMin = this.min ?? d3Array.min(series) ?? 0
    let fullMax = this.max ?? d3Array.max(series) ?? 0

    const domainTuple = (lo: number, hi: number): [number, number] => [lo, hi]

    /**
     * Single without custom `defaultTo`: Ion.RangeSlider paints the track from min → handle, so highlighted
     * bins use `x0 < from`; handle starts at domain max so the whole series is included initially.
     */
    const singleSelectAllRange = (_lo: number, hi: number): RangeValues => ({ from: hi, to: hi })

    const resetRangeToExtent = (lo: number, hi: number): RangeValues => {
      const single = this.type === 'single'
      if (!single && typeof this.defaultFrom === 'number' && typeof this.defaultTo === 'number') {
        return clampSelection(this.defaultFrom, this.defaultTo, lo, hi)
      }
      if (single && typeof this.defaultTo === 'number') {
        return { from: Math.min(Math.max(this.defaultTo, lo), hi), to: hi }
      }
      if (single) {
        return singleSelectAllRange(lo, hi)
      }
      return { from: lo, to: hi }
    }

    const syncSeriesAndFullExtent = () => {
      series = this.data ?? []
      fullMin = this.min ?? d3Array.min(series) ?? 0
      fullMax = this.max ?? d3Array.max(series) ?? 0
      this.chartSyncedData = this.data ?? null
      this.chartSyncedType = this.type
      if (this.colors) {
        colors = d3Scale
          .scaleLinear<string>()
          .domain(domainTuple(fullMin, fullMax))
          .range(this.colors)
      } else {
        colors = () => this.primaryColor
      }
    }

    const initialRangeForDomain = (domainMin: number, domainMax: number): RangeValues => {
      const zoomed = domainMin !== fullMin || domainMax !== fullMax
      const single = this.type === 'single'
      if (zoomed && single && typeof this.defaultTo === 'number') {
        return {
          from: Math.min(Math.max(this.defaultTo, domainMin), domainMax),
          to: domainMax
        }
      }
      if (zoomed && single) {
        return singleSelectAllRange(domainMin, domainMax)
      }
      if (zoomed) {
        return { from: domainMin, to: domainMax }
      }
      const mv = this.modelValue
      if (mv && typeof mv.from === 'number' && typeof mv.to === 'number') {
        return clampSelection(mv.from, mv.to, domainMin, domainMax)
      }
      return resetRangeToExtent(domainMin, domainMax)
    }

    let svg: SvgChartSelection
    let x: d3Scale.ScaleLinear<number, number>
    let y: d3Scale.ScaleLinear<number, number>
    /** Histogram root `<g>` (clip + brush + bar layer). Assigned before any async handler runs. */
    let hist!: SvgGroupSelection
    /** Bars only — avoids coupling rect inserts to the brush overlay node. */
    let barsLayer!: SvgGroupSelection
    /** Latest bin set from `updateHistogram`; starts empty until first paint. */
    let bins: BinDatum[] = []
    /** Either a colour scale along `x` or a solid fallback from props. */
    let colors: (_x: number) => string
    let brushBehavior: d3Brush.BrushBehavior<unknown> | undefined

    this.updateBarColor = (val: RangeValues) => {
      // Must not start a second transition on these rects: it interrupts the enter()
      // height tween and leaves bars at height 0 (only rx “tops” remain visible).
      barsLayer
        .selectAll<SVGRectElement, BinDatum>(`.vue-histogram-slider-bar-${this.id}`)
        .attr('fill', (d) => {
          if (this.type === 'single') {
            return d.x0 < val.from ? colors(d.x0) : this.holderColor
          }
          return d.x0 <= val.to && d.x0 >= val.from ? colors(d.x0) : this.holderColor
        })
    }

    syncSeriesAndFullExtent()

    x = d3Scale.scaleLinear().domain(domainTuple(fullMin, fullMax)).range([0, width]).clamp(true)

    y = d3Scale.scaleLinear().range([this.barHeight, 0])

    svg = d3Select
      .select<SVGSVGElement, unknown>(`#${this.id}`)
      .attr('width', width)
      .attr('height', this.barHeight)
      .on('dblclick', () => {
        if (!this.clip) {
          return
        }
        x.domain(domainTuple(fullMin, fullMax))
        if (brushBehavior) {
          hist.call(brushBehavior.clear)
        }
        updateHistogram([fullMin, fullMax])
        const pos = resetRangeToExtent(fullMin, fullMax)
        this.update(pos)
        this.emitRangeReset(pos)
      })

    hist = svg.append('g').attr('class', 'histogram')
    barsLayer = hist.append('g').attr('class', 'vue-histogram-slider-bars')

    if (this.clip) {
      hist.attr('clip-path', `url(#${this.clipId})`)
    }

    const updateHistogram = (
      [domainMin, domainMax]: [number, number],
      preserveZoomSelection = false,
      commitSelectionOnReady = false
    ) => {
      if (preserveZoomSelection && this.handleInteractionActive) return

      this.emitReady = false
      this.pendingPreserveCommit = null
      this.pendingBrushCommit = false
      syncSeriesAndFullExtent()

      barsLayer.selectAll(`.vue-histogram-slider-bar-${this.id}`).remove()

      const xDom = x.domain()
      const binGenerator = d3Array
        .bin()
        .domain(domainTuple(xDom[0], xDom[1]))
        .thresholds(width / (this.barWidth + this.barGap))

      bins = binGenerator(series) as BinDatum[]

      const maxCount = d3Array.max(bins, (d) => d.length) ?? 0
      y.domain([0, Math.max(maxCount, 1)])

      barsLayer
        .selectAll<SVGRectElement, BinDatum>(`.vue-histogram-slider-bar-${this.id}`)
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', `vue-histogram-slider-bar-${this.id}`)
        .attr('x', (d) => x(d.x0))
        .attr('y', (d) => y(d.length))
        .attr('rx', this.barRadius)
        .attr('width', this.barWidth)
        .attr('height', 0)
        .attr('fill', (d) => (this.type === 'single' ? this.holderColor : colors(d.x0)))
        .transition()
        .duration(this.transitionDuration)
        .attr('height', (d: BinDatum) => Math.max(0, this.barHeight - y(d.length)))

      const sliderRange =
        preserveZoomSelection && this.ionRangeSlider
          ? clampRangeToView(
              this.ionRangeSlider.result,
              domainMin,
              domainMax,
              this.type === 'single'
            )
          : initialRangeForDomain(domainMin, domainMax)

      if (this.ionRangeSlider) {
        $(`#${this.histogramId}`).prev('.irs').off('.vueHistSliderDrag')
        this.clearIonDragCapture()
        if (this.handleInteractionActive) {
          this.handleInteractionActive = false
        }
        this.ionRangeSlider.destroy()
      }

      this.histSlider = ($(`#${this.histogramId}`) as JQueryIonRange).ionRangeSlider({
        skin: 'round',
        min: domainMin,
        max: domainMax,
        from: sliderRange.from,
        to: sliderRange.to,
        type: this.type,
        grid: this.grid,
        step: this.step,
        from_fixed: this.fromFixed,
        to_fixed: this.toFixed,
        hide_min_max: this.hideMinMax,
        hide_from_to: this.hideFromTo,
        force_edges: this.forceEdges,
        drag_interval: this.dragInterval,
        grid_num: this.gridNum,
        block: this.block,
        keyboard: this.keyboard,
        prettify: this.prettify,
        onFinish: (val: RangeValues) => {
          if (!this.updateColorOnChange) {
            this.updateBarColor?.(val)
          }
          this.onIonHandleFinish(val)
        },
        onChange: (val: RangeValues) => {
          if (this.updateColorOnChange) {
            this.updateBarColor?.(val)
          }
          this.onSliderLive(val)
        }
      })

      this.ionRangeSlider = (this.histSlider as JQueryIonRange).data('ionRangeSlider') as IonRangeHandle
      this.bindIonDragStartEmitter()

      if (preserveZoomSelection) {
        this.pendingPreserveCommit = { ...sliderRange }
      }
      if (commitSelectionOnReady) {
        this.pendingBrushCommit = true
      }

      setTimeout(() => {
        if (this.ionRangeSlider && this.updateBarColor) {
          this.updateBarColor(this.ionRangeSlider.result)
        }
        this.emitReady = true
        if (this.pendingPreserveCommit) {
          const commit = this.pendingPreserveCommit
          this.pendingPreserveCommit = null
          this.commitSelection(commit)
        } else if (this.pendingBrushCommit && this.ionRangeSlider) {
          this.pendingBrushCommit = false
          this.commitSelection(this.ionRangeSlider.result)
        }
        this.flushDeferredUpdates()
      }, this.transitionDuration + 10)
    }

    this.chartPreserveZoomRedraw = () => {
      if (!this.ionRangeSlider || this.handleInteractionActive) return
      const d = x.domain()
      const lo = Math.min(d[0], d[1])
      const hi = Math.max(d[0], d[1])
      updateHistogram([lo, hi], true)
    }

    if (this.clip) {
      brushBehavior = d3Brush.brushX().on('end', (event: D3BrushEvent<unknown>) => {
        const extent = event.selection as [number, number] | null
        if (extent && extent.length === 2 && this.ionRangeSlider && brushBehavior) {
          const domain = [x.invert(extent[0]), x.invert(extent[1])] as [number, number]
          x.domain(domain)
          updateHistogram(domain, false, true)
          hist.call(brushBehavior.clear)
        }
      })
      hist.call(brushBehavior)
    }

    updateHistogram([fullMin, fullMax])
  },

  unmounted() {
    $(`#${this.histogramId}`)
      .prev('.irs')
      .off('.vueHistSliderDrag')
    this.clearIonDragCapture()
    if (this.handleInteractionActive) {
      this.handleInteractionActive = false
    }
    if (this.ionRangeSlider) {
      this.ionRangeSlider.destroy()
    }
    this.chartPreserveZoomRedraw = null
    this.handleInteractionActive = false
    this.chartSyncedData = null
    this.chartSyncedType = null
    this.pendingExternalModelValue = null
    this.pendingPreserveCommit = null
    this.pendingBrushCommit = false
  }
})
</script>

<style>
.vue-histogram-view {
  z-index: 9;
}

.slider-wrapper {
  width: 100%;
  margin-top: var(--hist-slider-gap);
}

.vue-histogram-slider-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.vue-histogram-slider-bar {
  pointer-events: none;
}

.irs {
  font-family: var(--font-family);
  font-size: var(--font-size);
  position: relative;
  display: block;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.irs-line {
  position: relative;
  display: block;
  overflow: hidden;
  outline: none !important;
  cursor: pointer;
}

.irs-bar {
  cursor: pointer;
  position: absolute;
  display: block;
  left: 0;
  width: 0;
}

.irs-shadow {
  position: absolute;
  display: none;
  left: 0;
  width: 0;
}

.irs-handle {
  position: absolute;
  display: block;
  box-sizing: border-box;
  cursor: default;
  z-index: 1;
}

.irs-handle.type_last {
  z-index: 2;
}

.irs-min,
.irs-max {
  position: absolute;
  display: block;
  cursor: default;
}

.irs-min {
  left: 0;
}

.irs-max {
  right: 0;
}

.irs-from,
.irs-to,
.irs-single {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  cursor: default;
  white-space: nowrap;
  z-index: 99;
}

.irs-grid {
  position: absolute;
  display: none;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
}

.irs-with-grid .irs-grid {
  display: block;
}

.irs-grid-pol {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 8px;
  background: #000;
}

.irs-grid-pol.small {
  height: var(--line-height);
}

.irs-grid-text {
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  text-align: center;
  font-size: 9px;
  line-height: 9px;
  padding: 0 3px;
  color: #000;
}

.irs-disable-mask {
  position: absolute;
  display: block;
  top: 0;
  left: -1%;
  width: 102%;
  height: 100%;
  cursor: default;
  background: rgba(0, 0, 0, 0);
  z-index: 2;
}

.lt-ie9 .irs-disable-mask {
  background: #000;
  filter: alpha(opacity=0);
  cursor: not-allowed;
}

.irs-disabled {
  opacity: 0.4;
}

.irs-hidden-input {
  position: absolute !important;
  display: block !important;
  top: 0 !important;
  left: 0 !important;
  width: 0 !important;
  height: 0 !important;
  font-size: 0 !important;
  line-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden;
  outline: none !important;
  z-index: -9999 !important;
  background: none !important;
  border-style: solid !important;
  border-color: transparent !important;
}

.irs--round {
  height: 50px;
}

.irs--round.irs-with-grid {
  height: 65px;
}

.irs--round .irs-line {
  top: 36px;
  height: var(--line-height);
  background-color: var(--holder-color);
  border-radius: var(--line-height);
}

.irs--round .irs-bar {
  top: 36px;
  height: var(--line-height);
  background-color: var(--primary-color);
}

.irs--round .irs-bar--single {
  border-radius: 4px 0 0 4px;
}

.irs--round .irs-shadow {
  height: var(--line-height);
  bottom: 21px;
  background-color: rgba(222, 228, 236, 0.5);
}

.irs--round .irs-handle {
  cursor: pointer;
  top: calc(50% - var(--handle-size) / 2 + 5px);
  width: var(--handle-size);
  height: var(--handle-size);
  background-color: var(--handle-color);
  z-index: 9;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 255, 0.3);
}

.irs--round .irs-handle.state_hover,
.irs--round .irs-handle:hover {
  background-color: #f0f6ff;
}

.irs--round .irs-min,
.irs--round .irs-max {
  color: #333;
  font-size: 14px;
  line-height: 1;
  top: 0;
  padding: 3px 5px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.irs--round .irs-from,
.irs--round .irs-to,
.irs--round .irs-single {
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  text-shadow: none;
  padding: 3px 5px;
  background-color: var(--label-color);
  color: white;
  border-radius: 4px;
}

.irs--round .irs-from:before,
.irs--round .irs-to:before,
.irs--round .irs-single:before {
  position: absolute;
  display: block;
  content: '';
  bottom: -6px;
  left: 50%;
  width: 0;
  height: 0;
  margin-left: -3px;
  overflow: hidden;
  border: 3px solid transparent;
  border-top-color: var(--primary-color);
}

.irs--round .irs-grid {
  height: 25px;
}

.irs--round .irs-grid-pol {
  background-color: #dedede;
}

.irs--round .irs-grid-text {
  color: var(--grid-text-color);
  font-size: 13px;
}
</style>
