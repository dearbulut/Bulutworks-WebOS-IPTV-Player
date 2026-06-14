import { MediabunnyEngine } from './MediabunnyEngine'
import { normalizeStreamUrl } from './url'

type Callback = () => void
type ErrCallback = (err: Error) => void

export class PlayerEngine {
  private _engine:   MediabunnyEngine | null = null
  private _onReady:   Callback | null = null
  private _onPlaying: Callback | null = null
  private _onError:   ErrCallback | null = null

  onReady(cb: Callback):   this { this._onReady   = cb; return this }
  onPlaying(cb: Callback): this { this._onPlaying = cb; return this }
  onError(cb: ErrCallback): this { this._onError  = cb; return this }

  load(url: string, canvas: HTMLCanvasElement): void {
    this.destroy()
    const engine = new MediabunnyEngine({
      onReady:   () => this._onReady?.(),
      onPlaying: () => this._onPlaying?.(),
      onError:   (err) => this._onError?.(err),
    })
    this._engine = engine
    void engine.load(normalizeStreamUrl(url), canvas)
  }

  destroy(): void {
    this._engine?.destroy()
    this._engine = null
  }
}
