<template>
  <div>
    <HistogramSlider
      style="margin: 200px auto"
      type="double"
      :width="900"
      :bar-height="110"
      :data="data"
      :prettify="prettify"
      :clip="true"
      :drag-interval="true"
      :hideFromTo="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#00f2fe']"
      :grid-num="2"
    />

    <HistogramSlider
      style="margin: 200px auto"
      ref="hist"
      type="double"
      :width="900"
      :bar-height="110"
      :data="data"
      :prettify="prettify"
      :clip="true"
      :drag-interval="true"
      :hideFromTo="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#00f2fe']"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HistogramSlider from './lib/HistogramSlider.vue'
import dataJson from '../resources/data.json'

export default defineComponent({
  components: {
    HistogramSlider
  },
  data() {
    return {
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
      
    }
  },

  mounted() {
    setTimeout(() => {
      const hist = this.$refs.hist as InstanceType<typeof HistogramSlider> | undefined
      hist?.update({ from: this.data[20], to: this.data[69] })
    }, 2000)
  }
})
</script>
