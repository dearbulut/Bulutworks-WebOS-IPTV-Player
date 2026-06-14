/** Prefer .m3u8 (HLS), fallback to .ts for direct stream URLs. */
export function normalizeStreamUrl(url: string): string {
  // Already has a proper extension
  if (/\.(m3u8|ts|mp4)(\?|$)/i.test(url)) return url
  // Xtream pattern without extension — append .m3u8
  return url + '.m3u8'
}

export function fallbackStreamUrl(url: string): string {
  return url.replace(/\.m3u8(\?|$)/i, '.ts$1')
}
