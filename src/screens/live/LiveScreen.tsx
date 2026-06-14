import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import { getProvider } from '../../providers'
import type { Category, Channel } from '../../providers/types'
import { Route, routeUrl } from '../../router/routes'
import CategoryColumn from './CategoryColumn'
import ChannelList from './ChannelList'
import PlayerSurface from '../../player/PlayerSurface'

const ALL_CATEGORY: Category = { id: '', name: 'All Channels' }

export default function LiveScreen() {
  const [categories,    setCategories]    = useState<Category[]>([ALL_CATEGORY])
  const [channels,      setChannels]      = useState<Channel[]>([])
  const [allChannels,   setAllChannels]   = useState<Channel[]>([])
  const [selectedCat,   setSelectedCat]   = useState<Category>(ALL_CATEGORY)
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [catLoading,    setCatLoading]    = useState(true)
  const [chLoading,     setChLoading]     = useState(true)
  const loadGenRef = useRef(0)

  const { ref, focusKey } = useFocusable({
    isFocusBoundary: true,
  })

  useEffect(() => {
    const gen = ++loadGenRef.current
    setCatLoading(true)
    setChLoading(true)

    const provider = getProvider()

    provider.getCategories().then((cats) => {
      if (gen !== loadGenRef.current) return
      setCategories([ALL_CATEGORY, ...cats])
      setCatLoading(false)
    }).catch(() => {
      if (gen !== loadGenRef.current) return
      setCatLoading(false)
    })

    provider.getLiveChannels().then((chs) => {
      if (gen !== loadGenRef.current) return
      setAllChannels(chs)
      setChannels(chs)
      setChLoading(false)
    }).catch(() => {
      if (gen !== loadGenRef.current) return
      setChLoading(false)
    })

    // Back key: webOS key code 461, or Escape in dev
    const onKey = (e: KeyboardEvent) => {
      if (e.keyCode === 461 || e.key === 'Escape') {
        window.location.hash = routeUrl(Route.Home)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      loadGenRef.current = gen + 1
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCat(cat)
    setChannels(cat.id ? allChannels.filter((ch) => ch.categoryId === cat.id) : allChannels)
    setActiveChannel(null)
  }, [allChannels])

  const handleChannelSelect = useCallback((ch: Channel) => {
    setActiveChannel(ch)
  }, [])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="live-screen">
        <CategoryColumn
          categories={categories}
          selectedCategoryId={selectedCat.id}
          loading={catLoading}
          onSelect={handleCategorySelect}
        />
        <ChannelList
          channels={channels}
          activeChannelId={activeChannel?.id ?? null}
          loading={chLoading}
          onSelect={handleChannelSelect}
        />
        <PlayerSurface url={activeChannel?.streamUrl ?? null} />
      </div>
    </FocusContext.Provider>
  )
}
