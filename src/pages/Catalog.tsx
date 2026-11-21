import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FEATURE_LABEL, PURPOSE_ACTION, TYPE_LABEL } from '../data/catalog'
import { PROPERTIES } from '../data/properties'
import { REGION_BY_ID } from '../data/regions'
import { Dialog } from '../components/Dialog'
import { EmptyState } from '../components/EmptyState'
import { FilterControls } from '../components/FilterControls'
import { PropertyCard } from '../components/PropertyCard'
import { useSeo } from '../hooks/useSeo'
import {
  applyFilters,
  countActive,
  DEFAULT_FILTERS,
  filtersFromParams,
  filtersToParams,
  hasPriceFilter,
  LAST_SEARCH_KEY,
  SORT_LABEL,
  type Filters,
  type SortKey,
} from '../lib/filters'
import { formatArea, formatCompactPrice } from '../lib/format'
import { readString, writeString } from '../lib/storage'
import styles from './Catalog.module.css'

const PAGE = 6

interface ActiveChip {
  key: string
  label: string
  remove: (f: Filters) => Filters
}

function activeChips(f: Filters): ActiveChip[] {
  const chips: ActiveChip[] = []
  if (f.purpose !== 'todos') chips.push({ key: 'purpose', label: PURPOSE_ACTION[f.purpose], remove: (x) => ({ ...x, purpose: 'todos', priceMin: null, priceMax: null }) })
  f.regions.forEach((r) => chips.push({ key: `r-${r}`, label: REGION_BY_ID[r]?.name ?? r, remove: (x) => ({ ...x, regions: x.regions.filter((i) => i !== r) }) }))
  f.types.forEach((t) => chips.push({ key: `t-${t}`, label: TYPE_LABEL[t], remove: (x) => ({ ...x, types: x.types.filter((i) => i !== t) }) }))
  if (hasPriceFilter(f)) {
    const label =
      f.priceMin !== null && f.priceMax !== null
        ? `${formatCompactPrice(f.priceMin)} a ${formatCompactPrice(f.priceMax)}`
        : f.priceMin !== null
          ? `A partir de ${formatCompactPrice(f.priceMin)}`
          : `Até ${formatCompactPrice(f.priceMax ?? 0)}`
    chips.push({ key: 'price', label, remove: (x) => ({ ...x, priceMin: null, priceMax: null }) })
  }
  if (f.bedrooms > 0) chips.push({ key: 'bed', label: `${f.bedrooms}+ quartos`, remove: (x) => ({ ...x, bedrooms: 0 }) })
  if (f.areaMin !== null) chips.push({ key: 'area', label: `A partir de ${formatArea(f.areaMin)}`, remove: (x) => ({ ...x, areaMin: null }) })
  f.features.forEach((ft) => chips.push({ key: `f-${ft}`, label: FEATURE_LABEL[ft], remove: (x) => ({ ...x, features: x.features.filter((i) => i !== ft) }) }))
  return chips
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const filters = useMemo(() => filtersFromParams(params), [params])
  const view: 'grid' | 'list' = params.get('visao') === 'lista' ? 'list' : 'grid'
  const results = useMemo(() => applyFilters(PROPERTIES, filters), [filters])
  const [visible, setVisible] = useState(PAGE)
  const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState(filters.q)
  const active = countActive(filters)
  const chips = activeChips(filters)

  useSeo('Explorar imóveis', `Catálogo com ${PROPERTIES.length} imóveis selecionados. Filtre por finalidade, região, tipo, preço, quartos, área e características.`)

  // Restaura a última busca quando o catálogo é aberto sem parâmetros.
  useEffect(() => {
    if (params.toString()) return
    const stored = readString(LAST_SEARCH_KEY, 'session')
    if (stored) navigate(`/imoveis?${stored}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commit = (next: Filters, nextView = view) => {
    const sp = filtersToParams(next)
    if (nextView === 'list') sp.set('visao', 'lista')
    setParams(sp, { replace: true, preventScrollReset: true })
    writeString(LAST_SEARCH_KEY, filtersToParams(next).toString(), 'session')
    setVisible(PAGE)
  }

  // Busca textual com pequeno atraso para não reescrever a URL a cada tecla.
  useEffect(() => {
    if (q === filters.q) return
    const t = window.setTimeout(() => commit({ ...filters, q }), 220)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  // Mantém o campo coerente quando a URL muda por navegação.
  useEffect(() => setQ(filters.q), [filters.q])

  const clearAll = () => {
    setQ('')
    commit({ ...DEFAULT_FILTERS, sort: filters.sort })
  }

  const shown = results.slice(0, visible)

  return (
    <div className={`container page-top ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="display-l">Explorar imóveis</h1>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" className={styles.searchIcon} />
          <label htmlFor="catalog-q" className="visually-hidden">
            Buscar por nome, bairro, cidade ou característica
          </label>
          <input
            id="catalog-q"
            type="search"
            className={`input ${styles.searchInput}`}
            placeholder="Nome, bairro ou característica"
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 80))}
            autoComplete="off"
          />
          {q && (
            <button type="button" className={`icon-btn ${styles.clearQ}`} aria-label="Limpar busca" onClick={() => setQ('')}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filtros">
          <div className={styles.sideHead}>
            <h2 className={styles.sideTitle}>Filtros</h2>
            {active > 0 && (
              <button type="button" className="text-link" onClick={clearAll}>
                Limpar ({active})
              </button>
            )}
          </div>
          <FilterControls filters={filters} onChange={(f) => commit(f)} variant="panel" />
        </aside>

        <section className={styles.results} aria-labelledby="results-count">
          <div className={styles.toolbar}>
            <p id="results-count" className={styles.count} aria-live="polite" aria-atomic="true">
              <strong className="tabular">{results.length}</strong> {results.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </p>
            <div className={styles.tools}>
              <button type="button" className={`btn btn--ghost btn--small ${styles.filterBtn}`} onClick={() => setDrawer(true)} aria-haspopup="dialog">
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filtros{active ? ` (${active})` : ''}
              </button>
              <label className="visually-hidden" htmlFor="catalog-sort">
                Ordenar por
              </label>
              <select id="catalog-sort" className={`select ${styles.sort}`} value={filters.sort} onChange={(e) => commit({ ...filters, sort: e.target.value as SortKey })}>
                {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABEL[k]}
                  </option>
                ))}
              </select>
              <div className="segmented" role="group" aria-label="Modo de visualização">
                <button type="button" aria-pressed={view === 'grid'} aria-label="Grade" onClick={() => commit(filters, 'grid')}>
                  <LayoutGrid size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-pressed={view === 'list'} aria-label="Lista" onClick={() => commit(filters, 'list')}>
                  <List size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className={styles.chips} aria-label="Filtros ativos">
              {chips.map((c) => (
                <li key={c.key}>
                  <button type="button" className={styles.activeChip} onClick={() => commit(c.remove(filters))} aria-label={`Remover filtro ${c.label}`}>
                    {c.label}
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="text-link" onClick={clearAll}>
                  Limpar tudo
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <EmptyState
              title="Nenhum imóvel com essa combinação"
              actions={
                <button type="button" className="btn btn--primary" onClick={clearAll}>
                  Limpar filtros
                </button>
              }
            >
              {chips.length > 0 ? (
                <div className={styles.suggest}>
                  <p>Tente retirar um dos filtros:</p>
                  <div className={styles.suggestChips}>
                    {chips.map((c) => (
                      <button key={c.key} type="button" className="chip" onClick={() => commit(c.remove(filters))}>
                        Sem “{c.label}”
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Nenhum resultado para “{filters.q}”. Confira a grafia ou busque por bairro ou cidade.</p>
              )}
            </EmptyState>
          ) : (
            <>
              <ul className={`${styles.grid} ${view === 'list' ? styles.list : ''}`}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((p, i) => (
                    <motion.li
                      key={p.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : Math.min(i % PAGE, 5) * 0.04 }}
                    >
                      <PropertyCard property={p} view={view} headingLevel="h2" />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div className={styles.more}>
                <p className="meta" aria-live="polite">
                  Mostrando {shown.length} de {results.length}
                </p>
                {visible < results.length && (
                  <button type="button" className="btn btn--ghost" onClick={() => setVisible((v) => v + PAGE)}>
                    Carregar mais {Math.min(PAGE, results.length - visible)}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <Dialog open={drawer} onClose={() => setDrawer(false)} className={styles.drawer} labelledBy="drawer-title">
        <div className={styles.drawerInner}>
          <div className={styles.drawerHead}>
            <h2 id="drawer-title" className={styles.sideTitle}>
              Filtros
            </h2>
            <button type="button" className="icon-btn" aria-label="Fechar filtros" onClick={() => setDrawer(false)}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.drawerBody}>
            <FilterControls filters={filters} onChange={(f) => commit(f)} variant="panel" />
          </div>
          <div className={styles.drawerFoot}>
            <button type="button" className="text-link" onClick={clearAll} disabled={active === 0}>
              Limpar
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setDrawer(false)}>
              {results.length === 0 ? 'Nenhum resultado' : `Ver ${results.length} ${results.length === 1 ? 'imóvel' : 'imóveis'}`}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
