export type WorkspaceTtl = 'session' | '24h' | '7d' | 'keep'

export type WorkspaceRecord = {
  id: string
  name: string
  note: string
  format: string
  structure: unknown
  ruleIds: string[]
  createdAt: string
  expiresAt: string | null
}

const DATABASE = 'decoding-local-workspace'
const STORE = 'redacted-records'
const VERSION = 1
const sensitiveKey =
  /(?:secret|token|password|passwd|authorization|cookie|private|signature|api[-_]?key|session)/i

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Unable to open the local workspace.'))
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local workspace operation failed.'))
  })
}

export function redactStructure(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value))
    return value.slice(0, 100).map((item) => redactStructure(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          sensitiveKey.test(key) ? '[redacted]' : redactStructure(item, depth + 1),
        ]),
    )
  }
  if (value === null) return null
  if (typeof value === 'boolean') return '[boolean]'
  if (typeof value === 'number') return '[number]'
  if (typeof value === 'string') return '[string]'
  return `[${typeof value}]`
}

function expiry(ttl: WorkspaceTtl): string | null {
  if (ttl === 'keep') return null
  const milliseconds = ttl === 'session' ? 0 : ttl === '24h' ? 86_400_000 : 604_800_000
  return new Date(Date.now() + milliseconds).toISOString()
}

export async function listWorkspaceRecords(): Promise<WorkspaceRecord[]> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  const store = transaction.objectStore(STORE)
  const records = await requestResult(store.getAll() as IDBRequest<WorkspaceRecord[]>)
  const now = Date.now()
  const active: WorkspaceRecord[] = []
  for (const record of records) {
    if (record.expiresAt && Date.parse(record.expiresAt) <= now) store.delete(record.id)
    else active.push(record)
  }
  database.close()
  return active.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export async function saveWorkspaceRecord(input: {
  name: string
  note: string
  format: string
  structure: unknown
  ruleIds: string[]
  ttl: WorkspaceTtl
}): Promise<WorkspaceRecord> {
  const record: WorkspaceRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim().slice(0, 100),
    note: input.note.trim().slice(0, 2_000),
    format: input.format.trim().slice(0, 80),
    structure: redactStructure(input.structure),
    ruleIds: input.ruleIds
      .map((rule) => rule.trim())
      .filter(Boolean)
      .slice(0, 50),
    createdAt: new Date().toISOString(),
    expiresAt: expiry(input.ttl),
  }
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  await requestResult(transaction.objectStore(STORE).put(record))
  database.close()
  return record
}

export async function deleteWorkspaceRecord(id: string): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  await requestResult(transaction.objectStore(STORE).delete(id))
  database.close()
}

export async function clearWorkspace(): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  await requestResult(transaction.objectStore(STORE).clear())
  database.close()
}

export async function workspaceUsage(): Promise<{ usage: number; quota: number }> {
  const estimate = await navigator.storage?.estimate()
  return { usage: estimate?.usage ?? 0, quota: estimate?.quota ?? 0 }
}
