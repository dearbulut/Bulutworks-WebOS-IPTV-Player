import type { Category, Channel, Provider } from './types'

interface XtreamCategory {
  category_id:   string | number
  category_name: string
}

interface XtreamStream {
  stream_id:    number
  name:         string
  stream_icon?: string
  category_id?: string | number
}

export class XtreamProvider implements Provider {
  constructor(private cfg: { host: string; username: string; password: string }) {}

  private get base() {
    return this.cfg.host.replace(/\/+$/, '')
  }

  private apiUrl(action: string, extra: Record<string, string> = {}): string {
    const p = new URLSearchParams({
      username: this.cfg.username,
      password: this.cfg.password,
      action,
      ...extra,
    })
    return `${this.base}/player_api.php?${p}`
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
    const { username: u, password: p } = this.cfg
    return data.map((s) => ({
      id:         String(s.stream_id),
      name:       s.name,
      logo:       s.stream_icon || undefined,
      categoryId: s.category_id != null ? String(s.category_id) : undefined,
      // HLS (.m3u8) first; url.ts provides .ts fallback helper
      streamUrl:  `${this.base}/live/${u}/${p}/${s.stream_id}.m3u8`,
      type:       'live' as const,
    }))
  }
}
