import { useEffect, useRef } from 'react'
import { useFocusable, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import type { Channel } from '../../providers/types'

interface ChannelRowProps {
  channel:  Channel
  active:   boolean
  onSelect: (ch: Channel) => void
}

export default function ChannelRow({ channel, active, onSelect }: ChannelRowProps) {
  const ref2 = useRef<HTMLDivElement>(null)

  const { ref, focused } = useFocusable({
    focusKey: `ch-${channel.id}`,
    onEnterPress: () => onSelect(channel),
    onFocus: () => {
      // Scroll into view when Norigin focuses this row
      ref2.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    },
    onArrowPress: (dir) => {
      if (dir === 'left') { setFocus('live-categories'); return true }
      return false
    },
  })

  // Merge refs
  useEffect(() => {
    if (ref.current && ref2.current !== ref.current) {
      (ref2 as React.MutableRefObject<HTMLDivElement | null>).current =
        ref.current as HTMLDivElement
    }
  })

  const cls = [
    'channel-row',
    focused ? 'channel-row--focused' : '',
    active  ? 'channel-row--active'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cls}
      onClick={() => onSelect(channel)}
      role="button"
      tabIndex={-1}
    >
      {channel.logo && (
        <img
          className="channel-row__logo"
          src={channel.logo}
          alt=""
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <span className="channel-row__name">{channel.name}</span>
    </div>
  )
}
