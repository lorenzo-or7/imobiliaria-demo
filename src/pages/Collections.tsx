import { COLLECTIONS } from '../data/catalog'
import { Img } from '../components/Img'
import { ImageReveal, TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import { byCollection } from '../lib/catalog'
import shared from './shared.module.css'
import styles from './Collections.module.css'

export default function Collections() {
  useSeo('Coleções', 'Arquitetura contemporânea, refúgios naturais, vida urbana e casas extraordinárias: quatro recortes do catálogo.')
  return (
    <div className={`container page-top ${shared.page}`}>
      <header className={shared.header}>
        <TextReveal as="h1" lines={['Coleções']} className="display-xl" trigger="mount" />
        <div>
          <p className="lead">Recortes temáticos do catálogo para quem já sabe que tipo de vida quer levar e ainda não sabe em qual endereço.</p>
        </div>
      </header>

      <ol className={styles.list}>
        {COLLECTIONS.map((c, i) => {
          const items = byCollection(c.id)
          return (
            <li key={c.id} className={`${styles.item} ${i % 2 ? styles.flip : ''}`}>
              <SiteLink to={`/colecoes/${c.id}`} className={styles.media} tabIndex={-1} aria-hidden="true">
                <ImageReveal className={styles.reveal}>
                  <Img src={c.cover} alt="" sizes="(min-width: 1024px) 55vw, 100vw" />
                </ImageReveal>
              </SiteLink>
              <div className={styles.text}>
                <p className={styles.count}>{items.length} imóveis</p>
                <h2 className="display-m">
                  <SiteLink to={`/colecoes/${c.id}`} className={styles.link}>
                    {c.title}
                  </SiteLink>
                </h2>
                <p className={styles.desc}>{c.description}</p>
                <ul className={styles.thumbs} aria-hidden="true">
                  {items.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Img src={p.photos[0].id} alt="" sizes="72px" maxWidth={480} />
                    </li>
                  ))}
                </ul>
                <SiteLink to={`/colecoes/${c.id}`} className="btn btn--ghost">
                  Abrir coleção
                </SiteLink>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
