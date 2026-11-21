import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { PROPERTY_BY_SLUG, PROPERTIES } from '../data/properties'
import { REGIONS, REGION_BY_ID, regionPlace } from '../data/regions'
import { Img } from '../components/Img'
import { ImageReveal, Magnetic, TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { markHeroTransition } from '../components/PropertyCard'
import styles from './Hero.module.css'

const HERO = PROPERTY_BY_SLUG['casa-jacaranda']

export function Hero() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const region = REGION_BY_ID[HERO.regionId]
  const photo = HERO.photos[0]

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.grid}>
        <motion.div className={styles.copy} style={reduce ? undefined : { y: copyY }}>
          <TextReveal as="h1" id="hero-title" lines={['Seu próximo', 'capítulo', 'começa aqui.']} className={`display-xl ${styles.title}`} trigger="mount" delay={0.45} />
          <motion.p className={`lead ${styles.lead}`} {...fade(0.95)}>
            Uma curadoria de espaços extraordinários para diferentes formas de viver.
          </motion.p>
          <motion.div className={styles.ctas} {...fade(1.1)}>
            <Magnetic>
              <SiteLink to="/imoveis" className="btn btn--primary">
                Explorar imóveis
              </SiteLink>
            </Magnetic>
            <SiteLink to="/colecoes" className="btn btn--ghost">
              Conhecer nossa curadoria
            </SiteLink>
          </motion.div>
          <motion.p className={styles.count} {...fade(1.25)}>
            {PROPERTIES.length} imóveis selecionados em {REGIONS.length} regiões, da capital ao litoral.
          </motion.p>
        </motion.div>

        <figure className={styles.figure} data-card>
          <ImageReveal trigger="mount" from="left" className={styles.frame} delay={0.05}>
            <motion.div className={styles.parallax} style={reduce ? undefined : { y: imgY }}>
              <Img src={photo.id} alt={photo.alt} sizes="(min-width: 1024px) 60vw, 100vw" priority className={styles.img} />
            </motion.div>
          </ImageReveal>
          <motion.figcaption className={styles.caption} {...fade(1.35)}>
            <span className={styles.capTitle}>{HERO.title}</span>
            <span className={styles.capMeta}>
              {regionPlace(region)}
            </span>
            <SiteLink to={`/imoveis/${HERO.slug}`} className="text-link" onClick={markHeroTransition}>
              Ver imóvel
            </SiteLink>
          </motion.figcaption>
        </figure>
      </div>
    </section>
  )
}
