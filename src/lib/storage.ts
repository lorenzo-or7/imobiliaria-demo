type StoreKind = 'local' | 'session'

function getStore(kind: StoreKind): Storage | null {
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage
    return store ?? null
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T, validate: (value: unknown) => value is T, kind: StoreKind = 'local'): T {
  const store = getStore(kind)
  if (!store) return fallback
  try {
    const raw = store.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return validate(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

/** Retorna false quando o navegador bloqueia ou não tem espaço para gravar. */
export function writeJSON(key: string, value: unknown, kind: StoreKind = 'local'): boolean {
  const store = getStore(kind)
  if (!store) return false
  try {
    store.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function readString(key: string, kind: StoreKind = 'local'): string | null {
  const store = getStore(kind)
  if (!store) return null
  try {
    return store.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string, kind: StoreKind = 'local'): boolean {
  const store = getStore(kind)
  if (!store) return false
  try {
    store.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string')
