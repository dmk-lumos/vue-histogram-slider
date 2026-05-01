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
import type { IonRangeSliderHandle } from '../types/jquery-ion-range-slider'
import type { Selection } from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Array from 'd3-array'
import * as d3Select from 'd3-selection'
import 'd3-transition'
import * as d3Brush from 'd3-brush'
import type { D3BrushEvent } from 'd3-brush'

let nextHistogramSliderUid = 0

export type RangeValues = { from: number; to: number }

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

type BinDatum = { x0: number; length: number }

/** Root SVG we draw the histogram into (parent in the DOM is HTML). */
type SvgChartSelection = Selection<SVGSVGElement, unknown, HTMLElement, unknown>
/** Histogram `<g>` and the inner `<g>` that only holds bar rects. */
type SvgGroupSelection = Selection<SVGGElement, unknown, HTMLElement, unknown>

/** jQuery + Ion.RangeSlider plugin (avoid relying on fragile module augmentation in SFCs). */
type JQueryIonRange = JQuery<HTMLElement> & {
  ionRangeSlider(_options?: Record<string, unknown>): JQuery<HTMLElement>
}

export default defineComponent({
  name: 'HistogramSlider',

  props,

  data(): {
    id: string
    histogramId: string
    clipId: string
    ionRangeSlider: IonRangeSliderHandle | null
    histSlider: JQuery<HTMLElement> | null
    updateBarColor: ((_range: RangeValues) => void) | null
  } {
    const uid = ++nextHistogramSliderUid
    return {
      id: `vue-histogram-${uid}`,
      histogramId: `histogram-slider-${uid}`,
      clipId: `clip-${uid}`,
      ionRangeSlider: null,
      histSlider: null,
      updateBarColor: null
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

  methods: {
    update({ from, to }: RangeValues) {
      if (this.ionRangeSlider) {
        this.ionRangeSlider.update({ from, to })
        this.updateBarColor?.({ from, to })
      }
    }
  },

  mounted() {
    const series: number[] = this.data ?? []
    const width = this.width - 20
    const min = this.min ?? d3Array.min(series) ?? 0
    const max = this.max ?? d3Array.max(series) ?? 0
    const isTypeSingle = this.type === 'single'

    const domainTuple = (lo: number, hi: number): [number, number] => [lo, hi]

    /**
     * Single without custom defaultFrom: Ion.RangeSlider paints the track from min → handle, so highlighted
     * bins use `x0 < from`; handle starts at domain max so the whole series is included initially.
     */
    const singleSelectAllRange = (_lo: number, hi: number): RangeValues => ({ from: hi, to: hi })

    const resetRangeToExtent = (lo: number, hi: number): RangeValues => {
      if (!isTypeSingle && typeof this.defaultFrom === 'number' && typeof this.defaultTo === 'number') {
        return clampSelection(this.defaultFrom, this.defaultTo, lo, hi)
      }
      if (isTypeSingle && typeof this.defaultFrom === 'number') {
        return { from: Math.min(Math.max(this.defaultFrom, lo), hi), to: hi }
      }
      if (isTypeSingle) {
        return singleSelectAllRange(lo, hi)
      }
      return { from: lo, to: hi }
    }

    const initialRangeForDomain = (domainMin: number, domainMax: number): RangeValues => {
      const zoomed = domainMin !== min || domainMax !== max
      if (zoomed && isTypeSingle && typeof this.defaultFrom === 'number') {
        return {
          from: Math.min(Math.max(this.defaultFrom, domainMin), domainMax),
          to: domainMax
        }
      }
      if (zoomed && isTypeSingle) {
        return singleSelectAllRange(domainMin, domainMax)
      }
      if (zoomed) {
        return { from: domainMin, to: domainMax }
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
          if (isTypeSingle) {
            return d.x0 < val.from ? colors(d.x0) : this.holderColor
          }
          return d.x0 <= val.to && d.x0 >= val.from ? colors(d.x0) : this.holderColor
        })
    }

    x = d3Scale.scaleLinear().domain(domainTuple(min, max)).range([0, width]).clamp(true)

    y = d3Scale.scaleLinear().range([this.barHeight, 0])

    svg = d3Select
      .select<SVGSVGElement, unknown>(`#${this.id}`)
      .attr('width', width)
      .attr('height', this.barHeight)
      .on('dblclick', () => {
        if (!this.clip) {
          return
        }
        x.domain(domainTuple(min, max))
        if (brushBehavior) {
          hist.call(brushBehavior.clear)
        }
        updateHistogram([min, max])
        const pos = resetRangeToExtent(min, max)
        this.update(pos)
        this.$emit('finish', pos)
        this.$emit('change', pos)
      })

    hist = svg.append('g').attr('class', 'histogram')
    barsLayer = hist.append('g').attr('class', 'vue-histogram-slider-bars')

    if (this.clip) {
      hist.attr('clip-path', `url(#${this.clipId})`)
    }

    if (this.colors) {
      colors = d3Scale
        .scaleLinear<string>()
        .domain(domainTuple(min, max))
        .range(this.colors)
    } else {
      colors = () => this.primaryColor
    }

    const updateHistogram = ([domainMin, domainMax]: [number, number]) => {
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
        .attr('fill', (d) => (isTypeSingle ? this.holderColor : colors(d.x0)))
        .transition()
        .duration(this.transitionDuration)
        .attr('height', (d: BinDatum) => Math.max(0, this.barHeight - y(d.length)))

      if (this.ionRangeSlider) {
        this.ionRangeSlider.destroy()
      }

      const sliderRange = initialRangeForDomain(domainMin, domainMax)

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
        onStart: (val: RangeValues) => {
          this.$emit('start', val)
        },
        onUpdate: (val: RangeValues) => {
          this.$emit('update', val)
        },
        onFinish: (val: RangeValues) => {
          if (!this.updateColorOnChange) {
            this.updateBarColor?.(val)
          }
          this.$emit('finish', val)
        },
        onChange: (val: RangeValues) => {
          if (this.updateColorOnChange) {
            this.updateBarColor?.(val)
          }
          this.$emit('change', val)
        }
      })

      this.ionRangeSlider = this.histSlider!.data('ionRangeSlider') as IonRangeSliderHandle

      setTimeout(() => {
        if (this.ionRangeSlider && this.updateBarColor) {
          this.updateBarColor(this.ionRangeSlider.result)
        }
      }, this.transitionDuration + 10)
    }

    if (this.clip) {
      brushBehavior = d3Brush.brushX().on('end', (event: D3BrushEvent<unknown>) => {
        const extent = event.selection as [number, number] | null
        if (extent && extent.length === 2 && this.ionRangeSlider && brushBehavior) {
          const domain = [x.invert(extent[0]), x.invert(extent[1])] as [number, number]
          x.domain(domain)
          const pos = {
            from: Math.max(domain[0], this.ionRangeSlider.result.from),
            to: Math.min(domain[1], this.ionRangeSlider.result.to)
          }
          this.$emit('finish', pos)
          this.$emit('change', pos)

          updateHistogram(domain)
          hist.call(brushBehavior.clear)
        }
      })
      hist.call(brushBehavior)
    }

    updateHistogram([min, max])
  },

  unmounted() {
    if (this.ionRangeSlider) {
      this.ionRangeSlider.destroy()
    }
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
