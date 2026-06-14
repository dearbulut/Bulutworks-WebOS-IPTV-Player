import type { Category, Channel, Provider } from './types'

/** djb2 hash → stable positive decimal string (mirrors PointTV M3U parser) */
function djb2(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fff_ffff
  return String(h || 1)
}

interface ExtinfAttrs {
  tvgId: string; name: string; logo: string; group: string
}

function parseExtinf(line: string): ExtinfAttrs {
  const tvgId   = line.match(/tvg-id="([^"]*)"/)?.[1]      ?? ''
  const tvgName = line.match(/tvg-name="([^"]*)"/)?.[1]    ?? ''
  const logo    = line.match(/tvg-logo="([^"]*)"/)?.[1]    ?? ''
  const group   = line.match(/group-title="([^"]*)"/)?.[1] ?? ''
  const name    = line.split(',').slice(1).join(',').trim() || tvgName
  return { tvgId, name: name || tvgName, logo, group: group.trim() }
}

interface Entry {
  id: string; name: string; logo: string; group: string; url: string
}

export class M3UProvider implements Provider {
  private _cache: Entry[] | null = null

  constructor(private cfg: { url: string }) {}

  private async parse(): Promise<Entry[]> {
    if (this._cache) return this._cache
    const res  = await fetch(this.cfg.url)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    const entries: Entry[] = []
    let i = lines[0]?.trim().startsWith('#EXTM3U') ? 1 : 0

    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line.startsWith('#EXTINF')) { i++; continue }
      const attrs = parseExtinf(line)
      const url   = (lines[i + 1] ?? '').trim()
      i += 2
      if (!url || url.startsWith('#')) continue
      // Skip VOD paths; this provider surfaces only live channels
      if (/\/(movie|series|vod)\//i.test(url)) continue
      entries.push({ id: djb2(url), name: attrs.name, logo: attrs.logo, group: attrs.group, url })
    }
    this._cache = entries
    return entries
  }

  async getCategories(): Promise<Category[]> {
    const entries = await this.parse()
    const seen = new Set<string>()
    const cats: Category[] = [{ id: '', name: 'All' }]
    for (const e of entries) {
      if (e.group && !seen.has(e.group)) {
        seen.add(e.group)
        cats.push({ id: djb2(e.group), name: e.group })
      }
    }
    return cats
  }

  async getLiveChannels(categoryId?: string): Promise<Channel[]> {
    const entries = await this.parse()
    return entries
      .filter((e) => !categoryId || categoryId === '' || djb2(e.group) === categoryId)
      .map((e) => ({
        id:         e.id,
        name:       e.name,
        logo:       e.logo || undefined,
        categoryId: e.group ? djb2(e.group) : undefined,
        streamUrl:  e.url,
        type:       'live' as const,
      }))
  }
}
