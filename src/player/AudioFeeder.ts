import type { AudioSampleSink, InputAudioTrack, AudioSample } from 'mediabunny'

const LEAD_TIME = 0.05   // seconds of scheduling lookahead
const DEBUG     = import.meta.env.VITE_PTV_DEBUG === '1'

let _nextId = 0

export class AudioFeeder {
  private readonly _fid  = _nextId++
  private _gen           = 0
  private _ctx:          AudioContext | null = null
  private _running       = false
  private _wallClockStart = 0
  private _nextStartTime  = 0

  async init(track: InputAudioTrack, sink: AudioSampleSink): Promise<void> {
    const sampleRate = await track.getSampleRate()
    this._ctx = new AudioContext({ sampleRate })
    void this._loop(sink, ++this._gen)
  }

  start(): void {
    if (this._running || !this._ctx) return
    this._running = true
    this._wallClockStart = this._ctx.currentTime + LEAD_TIME
    this._nextStartTime  = this._wallClockStart
  }

  stop(): void {
    this._running = false
    ++this._gen
    if (this._ctx) {
      this._ctx.close().catch(() => undefined)
      this._ctx = null
    }
  }

  private async _loop(sink: AudioSampleSink, startGen: number): Promise<void> {
    // Wait until start() is called
    while (!this._running && this._gen === startGen) {
      await new Promise<void>((r) => setTimeout(r, 50))
    }
    if (this._gen !== startGen || !this._ctx) return
    const ctx = this._ctx

    const targetSec = () => (ctx.currentTime - this._wallClockStart) + LEAD_TIME

    try {
      for await (const sample of sink.samples(0) as AsyncIterable<AudioSample>) {
        if (this._gen !== startGen || !this._running) break

        const samplePts    = sample.microsecondTimestamp / 1_000_000
        const sampleDurSec = sample.numberOfFrames / sample.sampleRate
        const sampleEndPts = samplePts + sampleDurSec

        // Skip samples entirely behind playhead (preroll)
        if (sampleEndPts <= targetSec()) continue

        const ch     = sample.numberOfChannels
        const frames = sample.numberOfFrames
        const sr     = sample.sampleRate

        // Trim leading frames of a sample that straddles the playhead
        const frameOffset  = Math.max(0, Math.floor((targetSec() - samplePts) * sr))
        const usableFrames = frames - frameOffset
        if (usableFrames <= 0) continue

        const buffer = ctx.createBuffer(ch, usableFrames, sr)
        for (let c = 0; c < ch; c++) {
          const tmp = new Float32Array(frames)
          sample.copyTo(tmp, { planeIndex: c, format: 'f32-planar' })
          buffer.getChannelData(c).set(tmp.subarray(frameOffset))
        }

        if (DEBUG && this._nextStartTime < ctx.currentTime) {
          console.warn(
            `[AudioFeeder#${this._fid}] underrun: behind ${(ctx.currentTime - this._nextStartTime).toFixed(3)}s`
          )
        }

        const node = ctx.createBufferSource()
        node.buffer = buffer
        node.connect(ctx.destination)
        node.start(Math.max(this._nextStartTime, ctx.currentTime))

        this._nextStartTime += usableFrames / sr
      }
    } catch (err) {
      if (this._gen === startGen) {
        console.error(`[AudioFeeder#${this._fid}] loop error:`, err)
      }
    }
  }
}
