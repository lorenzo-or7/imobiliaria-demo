import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { PROPERTIES, PROPERTY_BY_ID } from '../data/properties'
import { EmptyState } from '../components/EmptyState'
import { PropertyCard } from '../components/PropertyCard'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import { COMPARE_LIMIT, useSaved } from '../state/saved'
import { useToast } from '../state/toast'
import shared from './shared.module.css'
import styles from './Favorites.module.css'

export default function Favorites() {
  useSeo('Favoritos', 'Imóveis que você salvou neste navegador.')
  const { favorites, setCompare, storageAvailable } = useSaved()
  const { notify } = useToast()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<string[]>([])
  const items = favorites.map((id) => PROPERTY_BY_ID[id]).filter(Boolean)
  const validSelected = selected.filter((id) => favorites.includes(id))

  const toggleSelect = (id: string) => {
    if (validSelected.includes(id)) setSelected(validSelected.filter((x) => x !== id))
    else if (validSelected.length >= COMPARE_LIMIT) notify(`Selecione no máximo ${COMPARE_LIMIT} imóveis para comparar.`, { tone: 'error' })
    else setSelected([...validSelected, id])
  }

  const compareSelected = () => {
    setCompare(validSelected)
    navigate('/comparar', { viewTransition: true })
  }

  return (
    <div className={`container page-top ${shared.page}`}>
      <header className={shared.header}>
        <h1 className="display-xl">Favoritos</h1>
        <div>
          <p className="lead">
            {items.length === 0
              ? 'Salve imóveis tocando no coração. Eles ficam guardados neste navegador.'
              : `${items.length} ${items.length === 1 ? 'imóvel salvo' : 'imóveis salvos'} neste navegador. Selecione dois ou três para comparar.`}
          </p>
          {!storageAvailable && <p className="demo-note">O armazenamento local está bloqueado. Os favoritos valem apenas até fechar esta aba.</p>}
        </div>
      </header>

      {items.length === 0 ? (
        <>
          <EmptyState
            title="Nenhum imóvel salvo ainda"
            actions={
              <SiteLink to="/imoveis" className="btn btn--primary">
                Explorar imóveis
              </SiteLink>
            }
          >
            <p>Quando um imóvel chamar sua atenção, salve-o para rever depois ou comparar com outros.</p>
          </EmptyState>
          <section className={styles.suggest} aria-labelledby="sug-title">
            <h2 id="sug-title" className="display-s">
              Para começar
            </h2>
            <ul className={shared.grid}>
              {PROPERTIES.filter((p) => p.featured)
                .slice(0, 3)
                .map((p) => (
                  <li key={p.id}>
                    <PropertyCard property={p} />
                  </li>
                ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <div className={styles.toolbar} role="region" aria-label="Comparar favoritos">
            <p aria-live="polite">
              {validSelected.length === 0 ? 'Nenhum selecionado para comparar' : `${validSelected.length} de ${COMPARE_LIMIT} selecionados`}
            </p>
            <button type="button" className="btn btn--primary" disabled={validSelected.length < 2} onClick={compareSelected}>
              Comparar selecionados
            </button>
          </div>
          <ul className={shared.grid}>
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((p) => (
                <motion.li key={p.id} layout={!reduce} exit={{ opacity: 0, scale: 0.96 }} className={styles.item}>
                  <label className={`check ${styles.select}`}>
                    <input type="checkbox" checked={validSelected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                    <span>Selecionar para comparar</span>
                  </label>
                  <PropertyCard property={p} headingLevel="h2" />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  )
}
