import type { Category, Channel, Provider } from './types'

interface XtreamCategory {
  category_id:   string | number
  category_name: string
}

interface XtreamStream {
  stream_id:      number
  name:           string
  stream_icon?:   string
  category_id?:   string | number
  // Some providers supply a pre-built URL; prefer it over the canonical pattern.
  direct_source?: string
  stream_url?:    string
}

function maskUrl(url: string): string {
  return url.replace(
    /(\/(?:live|movie|series)\/[^/\s?#]+\/)([^/\s?#]+)(\/)/g,
    '$1•••$3',
  )
}

export class XtreamProvider implements Provider {
  private readonly host:     string
  private readonly username: string
  private readonly password: string

  constructor(cfg: { host: string; username: string; password: string }) {
    // Normalise once so every derived URL is consistent.
    this.host     = cfg.host.replace(/\/+$/, '')
    this.username = cfg.username
    this.password = cfg.password
  }

  private apiUrl(action: string, extra: Record<string, string> = {}): string {
    const p = new URLSearchParams({
      username: this.username,
      password: this.password,
      action,
      ...extra,
    })
    return `${this.host}/player_api.php?${p}`
  }

  async getCategories(): Promise<Category[]> {
    const res  = await fetch(this.apiUrl('get_live_categories'))
    const data = (await res.json()) as XtreamCategory[]
    return data.map((c) => ({
      id:   String(c.category_id),
      name: c.category_name,
    }))
  }

  async getLiveChannels(categoryId?: string): Promise<Channel[]> {
    const extra: Record<string, string> = {}
    if (categoryId) extra.category_id = categoryId
    const res  = await fetch(this.apiUrl('get_live_streams', extra))
    const data = (await res.json()) as XtreamStream[]

    const u = encodeURIComponent(this.username)
    const p = encodeURIComponent(this.password)

    const channels = data.map((s) => {
      // Prefer a provider-supplied URL when available and non-empty.
      const providerUrl = (s.direct_source || s.stream_url || '').trim()
      // Canonical Xtream Codes HLS pattern: /live/<user>/<pass>/<id>.m3u8
      const canonicalUrl = `${this.host}/live/${u}/${p}/${s.stream_id}.m3u8`
      const streamUrl = providerUrl || canonicalUrl

      return {
        id:         String(s.stream_id),
        name:       s.name,
        logo:       s.stream_icon || undefined,
        categoryId: s.category_id != null ? String(s.category_id) : undefined,
        streamUrl,
        type:       'live' as const,
      }
    })

    // Log one sample so the URL shape can be confirmed without leaking passwords.
    if (channels.length > 0) {
      console.info('[XtreamProvider] sample stream URL:', maskUrl(channels[0].streamUrl))
    }

    return channels
  }
}
