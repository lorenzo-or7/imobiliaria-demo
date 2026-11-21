import { BedDouble, Car, Ruler } from 'lucide-react'
import { PURPOSE_LABEL, TYPE_LABEL } from '../data/catalog'
import { REGION_BY_ID } from '../data/regions'
import type { Property } from '../data/types'
import { formatArea, formatPrice } from '../lib/format'
import { Img } from './Img'
import { CompareButton, FavoriteButton } from './SavedButtons'
import { SiteLink } from './SiteLink'
import styles from './PropertyCard.module.css'

/** Marca a foto clicada para a transição contínua catálogo → detalhe. */
export function markHeroTransition(e: React.MouseEvent<HTMLElement>) {
  // Um nome de transição precisa ser único na página: limpa marcações anteriores.
  document.querySelectorAll<HTMLElement>('img').forEach((el) => {
    if (el.style.viewTransitionName === 'property-hero') el.style.viewTransitionName = ''
  })
  const scope = e.currentTarget.closest('[data-card]') ?? e.currentTarget
  const img = scope.querySelector('img')
  if (img) img.style.viewTransitionName = 'property-hero'
}

interface Props {
  property: Property
  view?: 'grid' | 'list'
  sizes?: string
  headingLevel?: 'h2' | 'h3'
}

export function PropertyCard({ property: p, view = 'grid', sizes, headingLevel: H = 'h3' }: Props) {
  const region = REGION_BY_ID[p.regionId]
  const cover = p.photos[0]
  const href = `/imoveis/${p.slug}`
  return (
    <article className={`${styles.card} ${styles[view]}`} data-card>
      <div className={styles.mediaWrap}>
        <SiteLink to={href} className={styles.media} tabIndex={-1} aria-hidden="true" onClick={markHeroTransition}>
          <Img
            src={cover.id}
            alt=""
            sizes={sizes ?? (view === 'list' ? '(min-width: 900px) 360px, 100vw' : '(min-width: 1200px) 30vw, (min-width: 700px) 45vw, 100vw')}
            maxWidth={1440}
          />
        </SiteLink>
        <span className={styles.badge}>{PURPOSE_LABEL[p.purpose]}</span>
        <FavoriteButton property={p} className={styles.fav} />
      </div>

      <div className={styles.body}>
        <p className={styles.where}>
          {TYPE_LABEL[p.type]} em {region?.name}
        </p>
        <H className={styles.title}>
          <SiteLink to={href} onClick={markHeroTransition} className={styles.titleLink}>
            {p.title}
          </SiteLink>
        </H>
        {view === 'list' && <p className={styles.tagline}>{p.tagline}</p>}
        <p className={`${styles.price} tabular`}>{formatPrice(p.price, p.purpose)}</p>
        <ul className={styles.specs} aria-label="Características principais">
          <li>
            <Ruler size={15} aria-hidden="true" />
            <span className="tabular">{formatArea(p.area)}</span>
          </li>
          <li>
            <BedDouble size={15} aria-hidden="true" />
            <span>
              {p.bedrooms} {p.bedrooms === 1 ? 'quarto' : 'quartos'}
            </span>
          </li>
          <li>
            <Car size={15} aria-hidden="true" />
            <span>
              {p.parking} {p.parking === 1 ? 'vaga' : 'vagas'}
            </span>
          </li>
        </ul>
        <div className={styles.actions}>
          <CompareButton property={p} className={styles.cmp} />
        </div>
      </div>
    </article>
  )
}
