import { decode } from '@decoding/engine'

const menuId = 'decoding-inspect-selection'

function redact(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redact(item, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 100)
        .map(([key, item]) => [
          key,
          /secret|token|password|authorization|cookie|private|signature|key/i.test(key)
            ? '[redacted]'
            : redact(item, depth + 1),
        ]),
    )
  if (value === null) return null
  return `[${typeof value}]`
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() =>
    chrome.contextMenus.create({
      id: menuId,
      title: 'Inspect selection with decod.ing',
      contexts: ['selection'],
    }),
  )
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== menuId || !info.selectionText) return
  void decode(info.selectionText).then(async (result) => {
    const selected = result.root.selected ?? result.root.candidates[0]
    const redacted = selected
      ? {
          detector: selected.detector,
          label: selected.label,
          confidence: selected.confidence,
          summary: selected.summary,
          evidence: selected.evidence.map(({ code, message }) => ({ code, message })),
          warnings: selected.warnings,
          structure: redact(selected.value),
        }
      : { status: result.root.status, message: 'No supported format detected.' }
    await chrome.storage.session.set({ redactedResult: redacted })
    await chrome.tabs.create({ url: chrome.runtime.getURL('result.html') })
  })
})

chrome.action.onClicked.addListener(
  () => void chrome.tabs.create({ url: chrome.runtime.getURL('result.html') }),
)
