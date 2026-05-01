<template>
  <div class="histogram-demo-root">
    <div class="histogram-demo">
      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Standard Histogram Slider - Range Selection</h2>
          <p class="histogram-demo__lede">
            Two handles on timestamp data with brush zoom on the chart and the option to drag the whole
            selected span on the track.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li><code>type="double"</code> — two-handle range (default).</li>
                  <li><code>:drag-interval="true"</code> — drag both handles together (default is <code>false</code>).</li>
                  <li><code>:grid-num="2"</code> — two major divisions on the slider grid (default is <code>4</code>).</li>
                  <li><code>:hide-from-to="false"</code> — show formatted values on handles (matches default).</li>
                  <li><code>:clip="true"</code>, gradient <code>:colors</code>, <code>:prettify</code> — same as typical setup.</li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Brush the histogram to narrow the domain; double-click the chart to reset when
                <code>clip</code> is on. Grid ticks are on the slider strip below the SVG, not the histogram
                bars.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Single-handle Cutoff</h2>
          <p class="histogram-demo__lede">
            One thumb selects a single value on the same timeline; the histogram reflects single-handle
            colouring rules.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li><code>type="single"</code> — one handle; <code>drag-interval</code> is omitted (only applies to double sliders).</li>
                  <li>
                    Otherwise aligned with the first block: <code>:clip</code>, <code>:grid-num="2"</code>,
                    <code>:hide-from-to="false"</code>, same <code>:colors</code> and <code>:prettify</code>.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Drag toward earlier values to narrow from the high side of the axis. Double-click
                resets when <code>clip</code> is on.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="single"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Slider Grid Density</h2>
          <p class="histogram-demo__lede">
            Same double-handle setup as the first example; only the Ion.RangeSlider grid spacing changes so
            you can see what <code>gridNum</code> affects on the track.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li>
                    <code>:grid-num="4"</code> — library default; more tick marks under the track than the
                    blocks using <code>2</code>.
                  </li>
                  <li>
                    Matches the first example for <code>type</code>, <code>clip</code>,
                    <code>drag-interval</code>, <code>hide-from-to</code>, <code>colors</code>, and
                    <code>prettify</code>.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Histogram bar width is unchanged—only the labelled ticks on the slider below differ.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="4"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Bar Density</h2>
          <p class="histogram-demo__lede">
            Narrower, tighter-packed rects from <code>barWidth</code> and <code>barGap</code>; bin thresholds
            still follow chart width, but each bar draws thinner so more columns fit in view.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li>
                    <code>:bar-width="4"</code> — default is <code>6</code>; slimmer histogram columns.
                  </li>
                  <li>
                    <code>:bar-gap="2"</code> — default is <code>5</code>; less space between bars for a
                    denser chart.
                  </li>
                  <li>
                    Same interaction bundle as the first double example: <code>clip</code>,
                    <code>drag-interval</code>, <code>grid-num="2"</code>, cyan gradient
                    <code>colors</code>.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Zoom with brush—the bars redraw with the same geometry props inside the new domain.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :bar-width="4"
          :bar-gap="2"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Bar Color Gradient Customizations</h2>
          <p class="histogram-demo__lede">
            The <code>colors</code> prop feeds a linear scale along the value axis—swap stops for a different
            ramp without touching D3 directly.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li>
                    <code>:colors="['#667eea', '#764ba2']"</code> — purple ramp instead of the cyan/teal used
                    elsewhere here.
                  </li>
                  <li>
                    Defaults for <code>bar-width</code> / <code>bar-gap</code>; same double-handle setup as the
                    first example (<code>drag-interval</code>, <code>grid-num="2"</code>, labels visible).
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Selected-range highlighting still uses the gradient; “outside” bins fall back to the holder
                colour from props.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="gradientPurple"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Default Range - Single-handle</h2>
          <p class="histogram-demo__lede">
            <code>defaultFrom</code> pins the initial handle to the middle of the dataset; double-click the
            histogram to jump back there after you move it.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li>
                    <code>:default-from="(min + max) / 2"</code> — computed from the same timestamp series as
                    the other demos.
                  </li>
                  <li>
                    Same layout as the earlier single example: <code>clip</code>, <code>grid-num="2"</code>,
                    cyan gradient <code>colors</code>.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Drag the thumb, then double-click the chart—selection returns to the midpoint default while the
                domain resets to the full span.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="single"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :default-from="demoDefaultSingleHalf"
          :prettify="prettify"
          :clip="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Default Range - Double-handle</h2>
          <p class="histogram-demo__lede">
            <code>defaultFrom</code> and <code>defaultTo</code> trim the initial selection to the middle third;
            double-click restores that band after brush zoom or handle tweaks.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li>
                    <code>:default-from</code> / <code>:default-to</code> — one- and two-thirds along the data
                    extent (<code>min + span/3</code> … <code>min + 2·span/3</code>).
                  </li>
                  <li>
                    Matches the first double block for <code>drag-interval</code>, <code>grid-num="2"</code>,
                    <code>clip</code>, and gradient colours.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Brush to zoom, drag handles, then double-click—handles snap back to the ⅓–⅔ defaults on the
                full timeline.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :default-from="demoDefaultDoubleFrom"
          :default-to="demoDefaultDoubleTo"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="false"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          :grid-num="2"
          @finish="finish"
        />
      </section>

      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Hidden handle labels, programmatic <code>update()</code></h2>
          <p class="histogram-demo__lede">
            Double range with minimal chrome on the track; after load the demo calls
            <code>update()</code> on a component ref to snap the selection—useful when restoring filters or
            syncing external state.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Customizations</dt>
              <dd>
                <ul class="histogram-demo__prop-list">
                  <li><code>:hide-from-to="true"</code> — hide floating from/to labels (default is <code>false</code>).</li>
                  <li>
                    <code>:grid-num</code> omitted — uses default <code>4</code> (same grid density as the
                    previous block).
                  </li>
                  <li>
                    Parent calls <code>ref.update({ from, to })</code> in <code>mounted</code> after a short
                    delay; everything else matches the double-handle examples above.
                  </li>
                </ul>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Key features</dt>
              <dd>
                Watch the handles jump a few seconds after load; pair with your own data-loading pipeline in
                a real app.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          ref="demoProgrammatic"
          type="double"
          :width="sliderWidth"
          :bar-height="110"
          :data="data"
          :prettify="prettify"
          :clip="true"
          :drag-interval="true"
          :hideFromTo="true"
          :force-edges="false"
          :colors="['#4facfe', '#00f2fe']"
          @finish="finish"
        />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HistogramSlider from './lib/HistogramSlider.vue'
import dataJson from '../resources/data.json'

const SLIDER_MAX_WIDTH = 900
const SLIDER_GUTTER = 48

export default defineComponent({
  components: {
    HistogramSlider
  },
  data() {
    return {
      sliderWidth: SLIDER_MAX_WIDTH,
      /** Warm purple ramp for the gradient-only demo */
      gradientPurple: ['#667eea', '#764ba2'],
      data: (dataJson as string[]).map((d) => new Date(d).valueOf()),
      prettify(ts: number) {
        return new Date(ts).toLocaleDateString('en', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    }
  },

  computed: {
    demoDataMin(): number {
      return this.data.length ? Math.min(...this.data) : 0
    },
    demoDataMax(): number {
      return this.data.length ? Math.max(...this.data) : 0
    },
    demoDefaultSingleHalf(): number {
      return this.demoDataMin + (this.demoDataMax - this.demoDataMin) / 2
    },
    demoDefaultDoubleFrom(): number {
      return this.demoDataMin + (this.demoDataMax - this.demoDataMin) / 3
    },
    demoDefaultDoubleTo(): number {
      return this.demoDataMin + (2 * (this.demoDataMax - this.demoDataMin)) / 3
    }
  },

  methods: {
    finish(val: { from: number; to: number }) {
      console.log(val)
    },

    syncSliderWidth() {
      const w = typeof window !== 'undefined' ? window.innerWidth - SLIDER_GUTTER : SLIDER_MAX_WIDTH
      this.sliderWidth = Math.min(SLIDER_MAX_WIDTH, Math.max(280, w))
    }
  },

  mounted() {
    this.syncSliderWidth()
    window.addEventListener('resize', this.syncSliderWidth)

    setTimeout(() => {
      const demo = this.$refs.demoProgrammatic as InstanceType<typeof HistogramSlider> | undefined
      demo?.update({ from: this.data[20], to: this.data[69] })
    }, 2000)
  },

  unmounted() {
    window.removeEventListener('resize', this.syncSliderWidth)
  }
})
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>

<style scoped>
.histogram-demo-root {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1.5rem 3rem;
  background: linear-gradient(165deg, #f0f4f8 0%, #e8eef6 45%, #dfe8f2 100%);
  color: #1a2332;
}

.histogram-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3.5rem;
  width: 100%;
  max-width: 960px;
}

.histogram-demo__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.histogram-demo__header {
  width: 100%;
  max-width: 100%;
  text-align: center;
}

.histogram-demo__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.histogram-demo__title code {
  font-size: 0.92em;
  font-weight: 500;
  padding: 0.12em 0.35em;
  border-radius: 4px;
  background: rgba(0, 145, 255, 0.12);
  color: #005a9e;
}

.histogram-demo__lede {
  margin: 0 auto 1rem;
  max-width: 42rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #3d4f63;
}

.histogram-demo__meta {
  margin: 0 auto;
  max-width: 44rem;
  display: grid;
  gap: 0.65rem;
  text-align: left;
}

.histogram-demo__prop-list {
  margin: 0;
  padding-left: 1.15rem;
}

.histogram-demo__prop-list li {
  margin: 0.35em 0;
}

.histogram-demo__prop-list li:first-child {
  margin-top: 0;
}

.histogram-demo__prop-list li:last-child {
  margin-bottom: 0;
}

.histogram-demo__meta-row {
  display: grid;
  grid-template-columns: minmax(9rem, 12rem) 1fr;
  gap: 0.75rem 1rem;
  align-items: baseline;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 1px 3px rgba(26, 35, 50, 0.06);
}

.histogram-demo__meta-row dt {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5c6d80;
}

.histogram-demo__meta-row dd {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #2c3a49;
}

.histogram-demo__meta-row code {
  font-size: 0.84em;
  padding: 0.1em 0.3em;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.05);
}

@media (max-width: 520px) {
  .histogram-demo__meta-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .histogram-demo__meta-row dt {
    font-size: 0.68rem;
  }
}
</style>
