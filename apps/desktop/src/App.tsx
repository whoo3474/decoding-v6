import { operations, executeOperation, type OperationDescriptor } from '@decoding/operations'
import { ToolWorkbench, toolMessages } from '@decoding/workbench-ui'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import { check } from '@tauri-apps/plugin-updater'
import { useEffect, useMemo, useState } from 'preact/hooks'
import EngineWorkbench from './EngineWorkbench'

type View = 'decode' | 'tools' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('decode')
  const [query, setQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<OperationDescriptor | null>(null)
  const [externalInput, setExternalInput] = useState<{ id: number; value: string }>()
  const [message, setMessage] = useState('Ready — offline and local.')
  const [autostart, setAutostart] = useState(false)
  const visibleTools = useMemo(() => {
    const term = query.toLowerCase().trim()
    return term
      ? operations.filter((tool) =>
          [tool.name, tool.description, ...tool.aliases].some((value) =>
            value.toLowerCase().includes(term),
          ),
        )
      : operations
  }, [query])

  const inspectClipboard = async () => {
    try {
      const value = await readText()
      if (!value) {
        setMessage('Clipboard is empty. Previous payload was not retained.')
        return
      }
      setExternalInput({ id: Date.now(), value })
      setView('decode')
      await getCurrentWindow().show()
      await getCurrentWindow().setFocus()
      setMessage('Clipboard read once after your explicit action.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Clipboard access failed.')
    }
  }

  useEffect(() => {
    void isEnabled()
      .then(setAutostart)
      .catch(() => undefined)
    void register('CommandOrControl+Shift+D', () => void inspectClipboard())
      .then(() => setMessage('Global shortcut ready: ⌘/Ctrl + Shift + D'))
      .catch(() => setMessage('Global shortcut is unavailable or already used.'))
    return () => void unregisterAll()
  }, [])

  const toggleAutostart = async () => {
    if (autostart) await disable()
    else await enable()
    setAutostart(!autostart)
  }

  const checkUpdate = async () => {
    setMessage('Checking the signed update manifest…')
    try {
      const update = await check()
      setMessage(
        update
          ? `Signed update ${update.version} is available. Install from the release page.`
          : 'You are up to date.',
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update check failed.')
    }
  }

  return (
    <div class="desktop-app">
      <header class="desktop-header" data-tauri-drag-region>
        <div class="brand">
          <span class="brand-mark">
            d<span>/</span>
          </span>
          <span>
            decod<span class="brand-dot">.</span>ing
          </span>
        </div>
        <nav>
          <button class={view === 'decode' ? 'active' : ''} onClick={() => setView('decode')}>
            Decode
          </button>
          <button class={view === 'tools' ? 'active' : ''} onClick={() => setView('tools')}>
            47 Tools
          </button>
          <button class={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
            Settings
          </button>
        </nav>
        <button class="button primary small" onClick={() => void inspectClipboard()}>
          Inspect clipboard
        </button>
      </header>
      <main class="desktop-main">
        {view === 'decode' ? <EngineWorkbench externalInput={externalInput} /> : null}
        {view === 'tools' ? (
          selectedTool ? (
            <>
              <button class="button ghost" onClick={() => setSelectedTool(null)}>
                ← All tools
              </button>
              <div class="desktop-tool-heading">
                <span class="eyebrow">
                  Pack {selectedTool.pack} · {selectedTool.category}
                </span>
                <h1>{selectedTool.name}</h1>
                <p>{selectedTool.description}</p>
              </div>
              <ToolWorkbench
                operation={selectedTool}
                execute={executeOperation}
                messages={toolMessages.en}
              />
            </>
          ) : (
            <>
              <div class="desktop-tool-heading">
                <span class="eyebrow">Offline catalog</span>
                <h1>47 local tools</h1>
                <input
                  class="desktop-search"
                  type="search"
                  placeholder="Search tools and actions…"
                  value={query}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                />
              </div>
              <div class="tool-grid">
                {visibleTools.map((tool) => (
                  <button class="tool-card" onClick={() => setSelectedTool(tool)}>
                    <div class="tool-card-top">
                      <span class="tool-glyph">{tool.name.slice(0, 2).toUpperCase()}</span>
                      <span class="pack-badge">Pack {tool.pack}</span>
                    </div>
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                  </button>
                ))}
              </div>
            </>
          )
        ) : null}
        {view === 'settings' ? (
          <section class="settings-panel">
            <span class="eyebrow">Least privilege</span>
            <h1>Desktop settings</h1>
            <div class="setting-row">
              <div>
                <strong>Launch at login</strong>
                <p>Off by default. No background clipboard monitoring.</p>
              </div>
              <button class="button secondary" onClick={() => void toggleAutostart()}>
                {autostart ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div class="setting-row">
              <div>
                <strong>Signed updates</strong>
                <p>Checks only when you press the button. No automatic telemetry.</p>
              </div>
              <button class="button secondary" onClick={() => void checkUpdate()}>
                Check now
              </button>
            </div>
            <div class="setting-row">
              <div>
                <strong>Network</strong>
                <p>Zero requests unless you manually check the signed update manifest.</p>
              </div>
              <span class="privacy-line">
                <span class="privacy-dot" /> Offline
              </span>
            </div>
          </section>
        ) : null}
      </main>
      <footer class="desktop-status">
        <span class="privacy-dot" />
        {message}
        <span>Shortcut: ⌘/Ctrl ⇧ D</span>
      </footer>
    </div>
  )
}
