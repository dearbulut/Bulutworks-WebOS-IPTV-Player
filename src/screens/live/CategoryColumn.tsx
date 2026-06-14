import { useEffect } from 'react'
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import type { Category } from '../../providers/types'

interface CategoryRowProps {
  category:   Category
  selected:   boolean
  onSelect:   (cat: Category) => void
}

function CategoryRow({ category, selected, onSelect }: CategoryRowProps) {
  const { ref, focused } = useFocusable({
    focusKey: `cat-${category.id || 'all'}`,
    onEnterPress: () => onSelect(category),
    onArrowPress: (dir) => {
      if (dir === 'right') { setFocus('live-channels'); return true }
      return false
    },
  })

  const cls = [
    'category-row',
    focused  ? 'category-row--focused'  : '',
    selected ? 'category-row--selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cls}
      onClick={() => onSelect(category)}
      role="button"
      tabIndex={-1}
    >
      {category.name}
    </div>
  )
}

interface CategoryColumnProps {
  categories:         Category[]
  selectedCategoryId: string | undefined
  loading:            boolean
  onSelect:           (cat: Category) => void
}

export default function CategoryColumn({
  categories,
  selectedCategoryId,
  loading,
  onSelect,
}: CategoryColumnProps) {
  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey:             'live-categories',
    isFocusBoundary:      true,
    saveLastFocusedChild: true,
  })

  useEffect(() => { focusSelf() }, [focusSelf])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="live-category-column">
        <div className="live-pane__header">Categories</div>
        <div className="live-pane__scroll">
          {loading && <div className="live-pane__empty">Loading…</div>}
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id || 'all'}
              category={cat}
              selected={(selectedCategoryId ?? '') === cat.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  )
}
