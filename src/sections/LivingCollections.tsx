import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { COLLECTIONS } from '../data/catalog'
import { Img } from '../components/Img'
import { TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { byCollection } from '../lib/catalog'
import styles from './LivingCollections.module.css'

export function LivingCollections() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const stacked = useMediaQuery('(max-width: 1023px)')

  return (
    <section className={`section ${styles.section}`} aria-labelledby="collections-title">
      <div className="container">
        <header className={styles.head}>
          <TextReveal id="collections-title" lines={['Coleções para', 'cada forma de viver']} className="display-l" />
          <p className="lead">Quatro recortes do catálogo. Passe o cursor, toque ou navegue pelo teclado para abrir cada um.</p>
        </header>

        <ul className={styles.panels}>
          {COLLECTIONS.map((c, i) => {
            const items = byCollection(c.id)
            const isActive = stacked || i === active
            return (
              <li
                key={c.id}
                className={`${styles.panel} ${isActive ? styles.active : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <SiteLink to={`/colecoes/${c.id}`} className={styles.link} aria-describedby={`col-${c.id}-sum`}>
                  <Img src={c.cover} alt={c.coverAlt} sizes="(min-width: 1024px) 50vw, 100vw" className={styles.img} />
                  <span className={styles.scrim} aria-hidden="true" />
                  <span className={styles.index} aria-hidden="true">
                    {items.length} imóveis
                  </span>
                  <span className={styles.vertical} aria-hidden="true">
                    {c.title}
                  </span>
                  <span className={styles.content}>
                    <span className={styles.title}>{c.title}</span>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          className={styles.detail}
                          initial={reduce ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45, delay: reduce ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <span id={`col-${c.id}-sum`} className={styles.summary}>
                            {c.summary}
                          </span>
                          <span className={styles.thumbs} aria-hidden="true">
                            {items.slice(0, 4).map((p) => (
                              <Img key={p.id} src={p.photos[0].id} alt="" sizes="48px" maxWidth={480} className={styles.thumb} />
                            ))}
                          </span>
                          <span className={styles.cta}>Ver {items.length} imóveis</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </SiteLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
