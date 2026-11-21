import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PROPERTY_BY_ID } from '../data/properties'
import { isStringArray, readJSON, writeJSON } from '../lib/storage'

export const FAVORITES_KEY = 'atelier:favorites'
export const COMPARE_KEY = 'atelier:compare'
export const COMPARE_LIMIT = 3

type CompareResult = 'added' | 'removed' | 'full'

interface SavedContextValue {
  favorites: string[]
  compare: string[]
  storageAvailable: boolean
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => boolean
  removeFavorite: (id: string) => void
  isCompared: (id: string) => boolean
  toggleCompare: (id: string) => CompareResult
  removeCompare: (id: string) => void
  setCompare: (ids: string[]) => void
  clearCompare: () => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

/** Mantém apenas IDs existentes no catálogo atual, sem duplicatas. */
function clean(ids: string[], limit?: number): string[] {
  const valid = Array.from(new Set(ids.filter((id) => PROPERTY_BY_ID[id])))
  return limit ? valid.slice(0, limit) : valid
}

function usePersistentIds(key: string, limit?: number) {
  const [ids, setIds] = useState<string[]>(() => clean(readJSON(key, [], isStringArray), limit))
  const [ok, setOk] = useState(true)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setOk(writeJSON(key, ids))
  }, [key, ids])

  // Sincroniza entre abas abertas.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      setIds(clean(readJSON(key, [], isStringArray), limit))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, limit])

  return [ids, setIds, ok] as const
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites, favOk] = usePersistentIds(FAVORITES_KEY)
  const [compare, setCompareIds, cmpOk] = usePersistentIds(COMPARE_KEY, COMPARE_LIMIT)
  const compareRef = useRef(compare)
  const favRef = useRef(favorites)
  useEffect(() => {
    compareRef.current = compare
    favRef.current = favorites
  }, [compare, favorites])

  const toggleFavorite = useCallback(
    (id: string) => {
      const willAdd = !favRef.current.includes(id)
      setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
      return willAdd
    },
    [setFavorites],
  )

  const removeFavorite = useCallback((id: string) => setFavorites((list) => list.filter((x) => x !== id)), [setFavorites])

  const toggleCompare = useCallback(
    (id: string): CompareResult => {
      const current = compareRef.current
      if (current.includes(id)) {
        setCompareIds((list) => list.filter((x) => x !== id))
        return 'removed'
      }
      if (current.length >= COMPARE_LIMIT) return 'full'
      setCompareIds((list) => (list.includes(id) ? list : [...list, id].slice(0, COMPARE_LIMIT)))
      return 'added'
    },
    [setCompareIds],
  )

  const removeCompare = useCallback((id: string) => setCompareIds((list) => list.filter((x) => x !== id)), [setCompareIds])
  const setCompare = useCallback((ids: string[]) => setCompareIds(clean(ids, COMPARE_LIMIT)), [setCompareIds])
  const clearCompare = useCallback(() => setCompareIds([]), [setCompareIds])

  const value = useMemo<SavedContextValue>(
    () => ({
      favorites,
      compare,
      storageAvailable: favOk && cmpOk,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      removeFavorite,
      isCompared: (id) => compare.includes(id),
      toggleCompare,
      removeCompare,
      setCompare,
      clearCompare,
    }),
    [favorites, compare, favOk, cmpOk, toggleFavorite, removeFavorite, toggleCompare, removeCompare, setCompare, clearCompare],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved precisa de SavedProvider')
  return ctx
}
