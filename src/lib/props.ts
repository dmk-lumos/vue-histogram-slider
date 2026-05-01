import type { PropType } from 'vue'

export default {
  data: {
    type: Array as PropType<number[]>,
    required: true
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  },
  /** With `defaultTo`, sets initial double range and dblclick reset on full domain. */
  defaultFrom: {
    type: Number
  },
  /** See `defaultFrom`. */
  defaultTo: {
    type: Number
  },
  clip: {
    type: Boolean,
    default: true
  },
  block: {
    type: Boolean,
    default: false
  },
  grid: {
    type: Boolean,
    default: true
  },
  gridNum: {
    type: Number,
    default: 4
  },
  step: {
    type: Number,
    default: 1
  },
  hideMinMax: {
    type: Boolean,
    default: true
  },
  hideFromTo: {
    type: Boolean,
    default: false
  },
  toFixed: {
    type: Boolean,
    default: false
  },
  fromFixed: {
    type: Boolean,
    default: false
  },
  forceEdges: {
    type: Boolean,
    default: false
  },
  dragInterval: {
    type: Boolean,
    default: false
  },
  keyboard: {
    type: Boolean,
    default: true
  },
  type: {
    type: String as PropType<'double' | 'single'>,
    default: 'double',
    validator(value: unknown) {
      return value === 'double' || value === 'single'
    }
  },
  width: {
    type: Number,
    default: 650
  },
  barHeight: {
    type: Number,
    default: 100
  },
  barWidth: {
    type: Number,
    default: 6
  },
  barGap: {
    type: Number,
    default: 5
  },
  barRadius: {
    type: Number,
    default: 4
  },
  prettify: Function as PropType<((_value: number) => string) | undefined>,
  labelColor: {
    type: String,
    default: '#0091ff'
  },
  primaryColor: {
    type: String,
    default: '#0091ff'
  },
  holderColor: {
    type: String,
    default: '#dee4ec'
  },
  handleColor: {
    type: String,
    default: '#ffffff'
  },
  gridTextColor: {
    type: String,
    default: 'silver'
  },
  lineHeight: {
    type: Number,
    default: 6
  },
  transitionDuration: {
    type: Number,
    default: 80
  },
  fontFamily: {
    type: String,
    default: 'Arial, sans-serif'
  },
  fontSize: {
    type: Number,
    default: 12
  },
  histSliderGap: {
    type: Number,
    default: 6
  },
  colors: {
    type: Array as PropType<string[] | undefined>
  },
  updateColorOnChange: {
    type: Boolean,
    default: true
  },
  handleSize: {
    type: Number,
    default: 26
  }
}
