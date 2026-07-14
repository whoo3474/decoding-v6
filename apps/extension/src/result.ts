import './style.css'

const summary = document.querySelector('#summary')
const output = document.querySelector('#output')
const copy = document.querySelector<HTMLButtonElement>('#copy')

type StoredResult = {
  label?: string
  confidence?: number
  message?: string
  [key: string]: unknown
}

void chrome.storage.session.get('redactedResult').then(async ({ redactedResult: stored }) => {
  const redactedResult = (stored ?? {}) as StoredResult
  await chrome.storage.session.remove('redactedResult')
  const text = JSON.stringify(redactedResult ?? { message: 'The session result expired.' }, null, 2)
  if (summary)
    summary.textContent = redactedResult?.label
      ? `${redactedResult.label} · ${Math.round((redactedResult.confidence ?? 0) * 100)}% confidence`
      : (redactedResult?.message ?? 'No result')
  if (output) output.textContent = text
  copy?.addEventListener('click', () => void navigator.clipboard.writeText(text))
})
