import { Input, UrlSource, CanvasSink, AudioSampleSink, ALL_FORMATS } from 'mediabunny'
import { registerAc3Decoder } from '@mediabunny/ac3'
import { AudioFeeder } from './AudioFeeder'

// Register AC3 decoder once per app lifetime
let _ac3Registered = false
function ensureAc3() {
  if (!_ac3Registered) {
    registerAc3Decoder()
    _ac3Registered = true
  }
}

export interface EngineCallbacks {
  onReady?:   () => void
  onPlaying?: () => void
  onError?:   (err: Error) => void
}

export class MediabunnyEngine {
  private _input:    Input | null    = null
  private _feeder:   AudioFeeder | null = null
  private _gen       = 0
  private _canvas:   HTMLCanvasElement | null = null

  constructor(private readonly _callbacks: EngineCallbacks = {}) {}

  async load(url: string, canvas: HTMLCanvasElement): Promise<void> {
    this.destroy()
    ensureAc3()
    const gen = ++this._gen
    this._canvas = canvas

    let input: Input
    try {
      input = new Input({ source: new UrlSource(url), formats: ALL_FORMATS })
    } catch (err) {
      this._callbacks.onError?.(err instanceof Error ? err : new Error(String(err)))
      return
    }
    this._input = input

    try {
      const [videoTrack, audioTrack] = await Promise.all([
        input.getPrimaryVideoTrack(),
        input.getPrimaryAudioTrack(),
      ])
      if (gen !== this._gen) return

      this._callbacks.onReady?.()

      if (videoTrack) {
        const sink = new CanvasSink(videoTrack, {
          width:    canvas.width,
          height:   canvas.height,
          fit:      'contain',
          poolSize: 3,
        })
        // Fire-and-forget video loop
        void this._videoLoop(sink, canvas, gen)
      }

      if (audioTrack) {
        const feeder = new AudioFeeder()
        this._feeder = feeder
        const audioSink = new AudioSampleSink(audioTrack)
        await feeder.init(audioTrack, audioSink)
        if (gen !== this._gen) return
        feeder.start()
        this._callbacks.onPlaying?.()
      }
    } catch (err) {
      if (gen === this._gen) {
        this._callbacks.onError?.(err instanceof Error ? err : new Error(String(err)))
      }
    }
  }

  private async _videoLoop(
    sink:   CanvasSink,
    canvas: HTMLCanvasElement,
    startGen: number,
  ): Promise<void> {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      for await (const frame of sink.canvases()) {
        if (this._gen !== startGen) break
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(frame.canvas, 0, 0, canvas.width, canvas.height)
      }
    } catch (err) {
      if (this._gen === startGen) {
        this._callbacks.onError?.(err instanceof Error ? err : new Error(String(err)))
      }
    }
  }

  destroy(): void {
    ++this._gen
    this._feeder?.stop()
    this._feeder = null
    this._input?.dispose()
    this._input = null
    if (this._canvas) {
      const ctx = this._canvas.getContext('2d')
      ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height)
      this._canvas = null
    }
  }
}
