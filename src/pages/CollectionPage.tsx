import { useParams } from 'react-router-dom'
import { COLLECTION_BY_ID, COLLECTIONS } from '../data/catalog'
import type { CollectionId } from '../data/types'
import { EmptyState } from '../components/EmptyState'
import { Img } from '../components/Img'
import { ImageReveal, TextReveal } from '../components/motion'
import { PropertyCard } from '../components/PropertyCard'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import { byCollection } from '../lib/catalog'
import shared from './shared.module.css'
import styles from './CollectionPage.module.css'

export default function CollectionPage() {
  const { slug } = useParams()
  const c = slug ? COLLECTION_BY_ID[slug as CollectionId] : undefined
  useSeo(c ? c.title : 'Coleção não encontrada', c ? c.description : 'A coleção procurada não existe.')

  if (!c) {
    return (
      <div className="container section" style={{ paddingTop: 'clamp(120px, 14vw, 176px)' }}>
        <EmptyState
          title="Coleção não encontrada"
          actions={
            <SiteLink to="/colecoes" className="btn btn--primary">
              Ver todas as coleções
            </SiteLink>
          }
        />
      </div>
    )
  }

  const items = byCollection(c.id)
  const others = COLLECTIONS.filter((o) => o.id !== c.id)

  return (
    <div className={shared.page}>
      <section className={styles.hero}>
        <ImageReveal trigger="mount" className={styles.cover}>
          <Img src={c.cover} alt={c.coverAlt} sizes="100vw" priority />
        </ImageReveal>
        <div className={`container ${styles.heroText}`}>
          <SiteLink to="/colecoes" className="text-link">
            Todas as coleções
          </SiteLink>
          <TextReveal as="h1" lines={[c.title]} className="display-xl" trigger="mount" delay={0.3} />
          <p className="lead">{c.description}</p>
        </div>
      </section>

      <div className="container">
        <p className={styles.count} aria-live="polite">
          {items.length} imóveis nesta coleção
        </p>
        <ul className={shared.grid}>
          {items.map((p) => (
            <li key={p.id}>
              <PropertyCard property={p} headingLevel="h2" />
            </li>
          ))}
        </ul>

        <nav aria-labelledby="other-cols" className={styles.others}>
          <h2 id="other-cols" className="display-s">
            Outras coleções
          </h2>
          <ul>
            {others.map((o) => (
              <li key={o.id}>
                <SiteLink to={`/colecoes/${o.id}`} className={styles.other}>
                  <Img src={o.cover} alt="" sizes="96px" maxWidth={480} />
                  <span>{o.title}</span>
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
