import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PROPERTIES } from '../data/properties'
import { FilterControls } from '../components/FilterControls'
import { Img } from '../components/Img'
import { SiteLink } from '../components/SiteLink'
import { applyFilters, countActive, DEFAULT_FILTERS, filtersFromParams, filtersToParams, LAST_SEARCH_KEY, type Filters } from '../lib/filters'
import { readString, writeString } from '../lib/storage'
import styles from './Finder.module.css'

function initialFilters(): Filters {
  const stored = readString(LAST_SEARCH_KEY, 'session')
  if (stored) {
    const f = filtersFromParams(new URLSearchParams(stored))
    return f.purpose === 'todos' ? { ...f, purpose: 'venda', priceMin: null, priceMax: null } : f
  }
  return { ...DEFAULT_FILTERS, purpose: 'venda' }
}

export function Finder() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [moreOpen, setMoreOpen] = useState(() => filters.features.length > 0)
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const results = useMemo(() => applyFilters(PROPERTIES, filters), [filters])
  const query = filtersToParams(filters).toString()

  // Persistência entre páginas: o catálogo abre com a mesma busca.
  useEffect(() => {
    writeString(LAST_SEARCH_KEY, query, 'session')
  }, [query])

  const clear = () => setFilters({ ...DEFAULT_FILTERS, purpose: filters.purpose })
  const active = countActive(filters) - 1 // finalidade sempre está definida aqui
  const count = results.length

  return (
    <section className={`section ${styles.section}`} id="encontrar" aria-labelledby="finder-title">
      <div className={`container ${styles.layout}`}>
        <header className={styles.head}>
          <h2 id="finder-title" className="display-l">
            Encontre pelo que importa
          </h2>
          <p className="lead">Combine finalidade, região, tamanho e características. O resultado muda enquanto você escolhe.</p>
          <div className={styles.counter} aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                className={`${styles.number} tabular`}
                initial={reduce ? false : { y: '60%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: '-60%', opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className={styles.numberLabel}>{count === 1 ? 'imóvel combina com a busca' : 'imóveis combinam com a busca'}</span>
          </div>
          <ul className={styles.preview} aria-hidden="true">
            <AnimatePresence initial={false}>
              {results.slice(0, 4).map((p) => (
                <motion.li
                  key={p.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                >
                  <Img src={p.photos[0].id} alt="" sizes="96px" maxWidth={480} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </header>

        <form
          className={styles.panel}
          onSubmit={(e) => {
            e.preventDefault()
            if (count > 0) navigate(`/imoveis?${query}`, { viewTransition: true })
          }}
          aria-label="Buscar imóveis"
        >
          <FilterControls filters={filters} onChange={setFilters} variant="finder" showFeatures={moreOpen} />

          {!moreOpen && (
            <button type="button" className={`text-link ${styles.more}`} onClick={() => setMoreOpen(true)} aria-expanded={false}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              Mais características
            </button>
          )}

          <AnimatePresence initial={false}>
            {count === 0 && (
              <motion.div
                className={styles.empty}
                role="status"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p>
                  <strong>Nenhum imóvel atende a todos esses critérios.</strong> Tente outra região ou retire uma característica.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.actions}>
            <button type="button" className="text-link" onClick={clear} disabled={active === 0} style={active === 0 ? { opacity: 0.45 } : undefined}>
              Limpar filtros{active > 0 ? ` (${active})` : ''}
            </button>
            <div className={styles.submitGroup}>
              <SiteLink to="/comparar" className={`text-link ${styles.secondary}`}>
                Comparar imóveis
              </SiteLink>
              <button type="submit" className="btn btn--primary" disabled={count === 0}>
                {count === 0 ? 'Sem resultados' : `Ver ${count} ${count === 1 ? 'imóvel' : 'imóveis'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
