/** Instance stored under `$(el).data('ionRangeSlider')` by Ion.RangeSlider */
export interface IonRangeSliderHandle {
  destroy(): void
  update(opts: { from?: number; to?: number }): void
  readonly result: { from: number; to: number }
}

declare module 'jquery' {
  interface JQuery<TElement = HTMLElement> {
    ionRangeSlider(options?: Record<string, unknown>): JQuery<TElement>
  }
}
