import { useEffect, useRef, useState } from 'react'
import { PlayerEngine } from './PlayerEngine'

const CANVAS_W = 1280
const CANVAS_H = 720

/**
 * Mask the password segment in Xtream-style stream URLs so credentials
 * don't appear in error overlays or screenshots.
 * Input:  .../live/username/s3cr3t/12345.m3u8
 * Output: .../live/username/•••/12345.m3u8
 */
function maskCredentials(text: string): string {
  return text.replace(
    /(\/(?:live|movie|series)\/[^/\s?#]+\/)([^/\s?#]+)(\/)/g,
    '$1•••$3',
  )
}

interface PlayerSurfaceProps {
  url: string | null
}

export default function PlayerSurface({ url }: PlayerSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<PlayerEngine | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!url || !canvasRef.current) {
      setState('idle')
      return
    }

    setState('loading')
    setErrorMsg('')

    const engine = new PlayerEngine()
    engineRef.current = engine

    engine
      .onReady(()    => setState('loading'))
      .onPlaying(()  => setState('playing'))
      .onError((err) => {
        setState('error')
        setErrorMsg(maskCredentials(err.message))
      })

    engine.load(url, canvasRef.current)

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [url])

  return (
    <div className="player-surface">
      <canvas
        ref={canvasRef}
        className="player-surface__canvas"
        width={CANVAS_W}
        height={CANVAS_H}
      />
      {state === 'loading' && (
        <div className="player-surface__overlay">
          <div className="player-surface__spinner" />
        </div>
      )}
      {state === 'error' && (
        <div className="player-surface__overlay player-surface__overlay--error">
          <div className="player-surface__error-icon">!</div>
          <div className="player-surface__error-msg">{errorMsg || 'Playback error'}</div>
        </div>
      )}
      {state === 'idle' && (
        <div className="player-surface__overlay">
          <div className="player-surface__idle">← Select a channel</div>
        </div>
      )}
    </div>
  )
}
