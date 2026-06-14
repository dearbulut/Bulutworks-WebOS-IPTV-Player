declare global {
  interface Window {
    webOS?: {
      service?: {
        request: (uri: string, options: Record<string, unknown>) => void
      }
    }
  }
}

export function getMacFromLuna(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.webOS?.service) {
    return Promise.resolve(null)
  }
  return new Promise((resolve) => {
    window.webOS!.service!.request('luna://com.webos.service.wifi', {
      method: 'getStatus',
      onSuccess: (res: Record<string, unknown>) => {
        const mac = (res?.wifiInfo as Record<string, unknown>)?.macAddress
        resolve(typeof mac === 'string' ? mac : null)
      },
      onFailure: () => resolve(null),
    })
  })
}
