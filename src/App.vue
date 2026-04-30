<template>
  <div class="histogram-demo-root">
    <div class="histogram-demo">
      <section class="histogram-demo__card">
        <header class="histogram-demo__header">
          <h2 class="histogram-demo__title">Sparse grid + visible range labels</h2>
          <p class="histogram-demo__lede">
            Double-handle range on timestamp data with brush clipping, interval dragging, sparse axis
            ticks, and the from/to bubbles left visible so formatted values stay on-screen.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Mode</dt>
              <dd><code>type="double"</code> — two handles, range selection</dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Interaction</dt>
              <dd>
                <code>clip</code> + brush on the histogram, <code>drag-interval</code> to move the whole
                span, <code>:hideFromTo="false"</code> shows the floating from/to labels (still driven by
                <code>prettify</code>)
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Distinction</dt>
              <dd>
                <code>:grid-num="2"</code> for fewer grid ticks than the default below, and unlike the
                second demo the handle labels are not hidden
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
          <h2 class="histogram-demo__title">Default grid + hidden labels + programmatic <code>update()</code></h2>
          <p class="histogram-demo__lede">
            Same core behavior as the first slider (colors, clip, interval drag) but with denser default
            grid ticks, from/to bubbles hidden for a minimal chrome look, and an imperative range jump
            after mount.
          </p>
          <dl class="histogram-demo__meta">
            <div class="histogram-demo__meta-row">
              <dt>Mode</dt>
              <dd>
                <code>type="double"</code> — same two-handle range model; differs mainly in
                <code>gridNum</code>, <code>hideFromTo</code>, and the scripted <code>update()</code>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Properties</dt>
              <dd>
                Default <code>gridNum</code> (4), same gradient <code>colors</code>, <code>clip</code>,
                <code>drag-interval</code>, <code>:hideFromTo="true"</code> to hide the handle labels,
                <code>force-edges="false"</code>
              </dd>
            </div>
            <div class="histogram-demo__meta-row">
              <dt>Distinction</dt>
              <dd>
                After two seconds, the demo calls <code>ref.update({ from, to })</code> to snap the range
                — useful for syncing the widget to external filters or restored UI state
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
