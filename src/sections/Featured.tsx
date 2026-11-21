import { PURPOSE_LABEL, TYPE_LABEL } from '../data/catalog'
import { PROPERTY_BY_SLUG } from '../data/properties'
import { REGION_BY_ID } from '../data/regions'
import type { Property } from '../data/types'
import { Img } from '../components/Img'
import { ImageReveal, Parallax, TextReveal } from '../components/motion'
import { markHeroTransition } from '../components/PropertyCard'
import { FavoriteButton } from '../components/SavedButtons'
import { SiteLink } from '../components/SiteLink'
import { formatArea, formatPrice } from '../lib/format'
import styles from './Featured.module.css'

/** Cada slot tem escala e proporção próprias para compor uma página editorial. */
const SPREAD: { slug: string; slot: string; sizes: string }[] = [
  { slug: 'casa-brise', slot: 'a', sizes: '(min-width: 1024px) 58vw, 100vw' },
  { slug: 'casa-cobogo', slot: 'b', sizes: '(min-width: 1024px) 34vw, 100vw' },
  { slug: 'casa-ripado', slot: 'c', sizes: '(min-width: 1024px) 34vw, 100vw' },
  { slug: 'casa-falesia', slot: 'd', sizes: '(min-width: 1024px) 50vw, 100vw' },
  { slug: 'residencia-lamina', slot: 'e', sizes: '(min-width: 1024px) 66vw, 100vw' },
]

function FeatureItem({ property: p, slot, sizes }: { property: Property; slot: string; sizes: string }) {
  const region = REGION_BY_ID[p.regionId]
  const href = `/imoveis/${p.slug}`
  return (
    <article className={`${styles.item} ${styles[slot]}`} data-card>
      <div className={styles.mediaWrap}>
        <SiteLink to={href} className={styles.media} tabIndex={-1} aria-hidden="true" onClick={markHeroTransition}>
          <ImageReveal className={styles.reveal}>
            <Parallax className={styles.px} strength={0.05}>
              <Img src={p.photos[0].id} alt={p.photos[0].alt} sizes={sizes} />
            </Parallax>
          </ImageReveal>
        </SiteLink>
        <FavoriteButton property={p} className={styles.fav} />
      </div>
      <div className={styles.text}>
        <p className={styles.category}>
          {TYPE_LABEL[p.type]} para {PURPOSE_LABEL[p.purpose].toLowerCase()}, {region?.name}
        </p>
        <h3 className={styles.name}>
          <SiteLink to={href} onClick={markHeroTransition}>
            {p.title}
          </SiteLink>
        </h3>
        <p className={styles.tagline}>{p.tagline}</p>
        <dl className={styles.specs}>
          <div>
            <dt>Preço</dt>
            <dd className="tabular">{formatPrice(p.price, p.purpose)}</dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd className="tabular">{formatArea(p.area)}</dd>
          </div>
          <div>
            <dt>Quartos</dt>
            <dd>{p.bedrooms}</dd>
          </div>
          <div>
            <dt>Vagas</dt>
            <dd>{p.parking}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export function Featured() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="featured-title">
      <div className="container">
        <header className={styles.head}>
          <TextReveal id="featured-title" lines={['Curadoria', 'em destaque']} className="display-l" />
          <div className={styles.intro}>
            <p className="lead">Imóveis escolhidos pelo projeto, pela implantação e pela forma como recebem a luz ao longo do dia.</p>
            <SiteLink to="/imoveis" className="text-link">
              Ver todos os imóveis
            </SiteLink>
          </div>
        </header>
        <div className={styles.spread}>
          {SPREAD.map(({ slug, slot, sizes }) => {
            const p = PROPERTY_BY_SLUG[slug]
            return p ? <FeatureItem key={slug} property={p} slot={slot} sizes={sizes} /> : null
          })}
        </div>
      </div>
    </section>
  )
}
