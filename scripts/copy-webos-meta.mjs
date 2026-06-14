import { cpSync, existsSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src  = resolve(__dirname, '../webos-meta')
const dest = resolve(__dirname, '../dist')

mkdirSync(dest, { recursive: true })

if (existsSync(src)) {
  cpSync(src, dest, { recursive: true })
  console.log('webos-meta copied to dist/')
} else {
  console.warn('webos-meta/ not found — skipping copy')
}
