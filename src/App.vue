<template>
  <div class="histogram-demo-root">
    <div class="histogram-demo">
      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Example: Date Range Histogram</h2>
          <p class="histogram-demo__lede">
            Two handles on a timeline of sample dates. Brush the histogram to zoom, grab both handles at
            once to slide the whole window, and keep the readable dates on the handles—nothing’s hidden.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Mode</dt>
              <dd>A classic “from → to” range on the same dataset every example uses.</dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Worth trying</dt>
              <dd>
                Drag the shaded interval as one piece. Double-click the chart resets the zoom when clipping
                is on.
                <span class="histogram-demo__hint">(<code>double</code>, sparse ticks, labels shown)</span>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Compared below</dt>
              <dd>
                The next block swaps to one handle with the same look. The last one hides the date bubbles
                and nudges the range from code after load.
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
          <h2 class="histogram-demo__title">Example: Date Cutoff Histogram</h2>
          <p class="histogram-demo__lede">
            Same colours, spacing, and gentle tick marks as above—but one thumb, so you’re choosing a
            single moment on the timeline instead of a span.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Mode</dt>
              <dd>
                Single-handle mode for selecting data up to a cutoff point
                <span class="histogram-demo__hint">(<code>type="single"</code>)</span>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Worth trying</dt>
              <dd>
                Scroll up once: the highlighted bins read differently with one handle versus two—that’s
                the main visual story.
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Compared above</dt>
              <dd>
                Matches the first demo’s styling; range-drag isn’t applicable here because there’s only one
                handle.
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
          <h2 class="histogram-demo__title">Example: Programmatic Updates</h2>
          <p class="histogram-demo__lede">
            Two handles again and the same gradient story, but more ticks along the track and no floating
            date labels—cleaner at a glance. Wait two seconds: the selection snaps elsewhere to show how
            your app can drive the slider after data loads.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Mode</dt>
              <dd>
                Range selection like the top example, presented with less on-screen text and a busier axis.
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Worth trying</dt>
              <dd>
                Watch for the timed jump—that mimics restoring a saved filter or applying a preset from
                your UI.
                <span class="histogram-demo__hint">(<code>update()</code> on a ref)</span>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Compared above</dt>
              <dd>
                More grid ticks than the first pair; handle dates stay tucked away so only the chart and bar
                carry most of the signal.
              </dd>
            </div>
          </dl>
        </header>
        <HistogramSlider
          ref="hist"
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
      const hist = this.$refs.hist as InstanceType<typeof HistogramSlider> | undefined
      hist?.update({ from: this.data[20], to: this.data[69] })
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

.histogram-demo__meta-row {
  display: grid;
  grid-template-columns: 7rem 1fr;
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

.histogram-demo__hint {
  color: #5c6d80;
  font-size: 0.92em;
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
