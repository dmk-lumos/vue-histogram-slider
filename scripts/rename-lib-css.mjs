import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const from = path.join(dist, 'style.css')
const to = path.join(dist, 'histogram-slider.css')

if (fs.existsSync(from)) {
  fs.renameSync(from, to)
}
