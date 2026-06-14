import { useEffect } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import type { Channel } from '../../providers/types'
import ChannelRow from './ChannelRow'

interface ChannelListProps {
  channels:        Channel[]
  activeChannelId: string | null
  loading:         boolean
  onSelect:        (ch: Channel) => void
}

export default function ChannelList({ channels, activeChannelId, loading, onSelect }: ChannelListProps) {
  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey:             'live-channels',
    isFocusBoundary:      true,
    saveLastFocusedChild: true,
  })

  // Focus first channel whenever the list is replaced (category switch)
  useEffect(() => {
    if (channels.length > 0) focusSelf()
  }, [channels, focusSelf])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="live-channel-list">
        <div className="live-pane__header">Channels</div>
        <div className="live-pane__scroll">
          {loading && <div className="live-pane__empty">Loading…</div>}
          {!loading && channels.length === 0 && (
            <div className="live-pane__empty">No channels</div>
          )}
          {channels.map((ch) => (
            <ChannelRow
              key={ch.id}
              channel={ch}
              active={ch.id === activeChannelId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  )
}
