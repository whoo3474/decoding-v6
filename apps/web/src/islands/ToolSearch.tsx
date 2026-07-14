import type { OperationDescriptor } from '@decoding/operations'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

export default function ToolSearch({ tools }: { tools: OperationDescriptor[] }) {
  const [hydrated, setHydrated] = useState(false)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const valid = new Set(tools.map((tool) => tool.id))
    const readSlugs = (key: string) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
        return Array.isArray(value)
          ? value
              .filter((slug): slug is string => typeof slug === 'string' && valid.has(slug))
              .slice(0, 12)
          : []
      } catch {
        return []
      }
    }
    setFavorites(readSlugs('decoding-favorite-tools'))
    setRecent(readSlugs('decoding-recent-tools'))
    setHydrated(true)
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        search.current?.focus()
      }
    }
    addEventListener('keydown', shortcut)
    return () => removeEventListener('keydown', shortcut)
  }, [tools])

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((slug) => slug !== id) : [id, ...current]
      localStorage.setItem('decoding-favorite-tools', JSON.stringify(next))
      return next
    })
  }
  const remember = (id: string) => {
    const next = [id, ...recent.filter((slug) => slug !== id)].slice(0, 8)
    localStorage.setItem('decoding-recent-tools', JSON.stringify(next))
    setRecent(next)
  }
  const recentTools = recent
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is OperationDescriptor => Boolean(tool))
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return tools
    return tools.filter((tool) =>
      [tool.name, tool.description, tool.category, ...tool.aliases].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [query, tools])
  const groups = useMemo(() => {
    const grouped = new Map<string, OperationDescriptor[]>()
    for (const tool of visible)
      grouped.set(tool.category, [...(grouped.get(tool.category) ?? []), tool])
    return grouped
  }, [visible])
  return (
    <div class="catalog-shell" data-hydrated={hydrated}>
      <label class="search-box">
        <span>Search all 47 local tools</span>
        <input
          type="search"
          ref={search}
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="format JSON, inspect JWT, generate UUID…"
          autofocus
        />
      </label>
      <p class="catalog-count" aria-live="polite">
        {visible.length} of {tools.length} tools
      </p>
      {recentTools.length && !query ? (
        <section class="recent-tools" aria-labelledby="recent-tools">
          <div class="section-heading compact">
            <span class="eyebrow">Stored slugs only</span>
            <h2 id="recent-tools">Recent tools</h2>
          </div>
          <div class="recent-links">
            {recentTools.map((tool) => (
              <a href={`/${tool.id}/`} onClick={() => remember(tool.id)}>
                {tool.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}
      {[...groups.entries()].map(([category, items]) => (
        <section class="tool-group" aria-labelledby={`category-${category}`} key={category}>
          <div class="section-heading compact">
            <span class="eyebrow">Category</span>
            <h2 id={`category-${category}`}>{category}</h2>
          </div>
          <div class="tool-grid">
            {items.map((tool) => (
              <article class="tool-card" key={tool.id}>
                <div class="tool-card-top">
                  <span class="tool-glyph" aria-hidden="true">
                    {tool.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div class="tool-card-actions">
                    <span class={`pack-badge pack-${tool.pack}`}>Pack {tool.pack}</span>
                    <button
                      class="favorite-button"
                      type="button"
                      aria-label={`${favorites.includes(tool.id) ? 'Remove' : 'Add'} ${tool.name} ${favorites.includes(tool.id) ? 'from' : 'to'} favorites`}
                      aria-pressed={favorites.includes(tool.id)}
                      onClick={() => toggleFavorite(tool.id)}
                    >
                      {favorites.includes(tool.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
                <a class="tool-card-link" href={`/${tool.id}/`} onClick={() => remember(tool.id)}>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <span class="card-link">Open tool →</span>
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {!visible.length ? (
        <div class="empty-catalog">No matching tool. Try a format, action, or alias.</div>
      ) : null}
    </div>
  )
}
