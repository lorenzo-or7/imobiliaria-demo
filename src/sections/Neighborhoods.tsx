import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PURPOSE_LABEL } from '../data/catalog'
import { PROPERTIES } from '../data/properties'
import { REGIONS } from '../data/regions'
import { Img } from '../components/Img'
import { TextReveal } from '../components/motion'
import { markHeroTransition } from '../components/PropertyCard'
import { SiteLink } from '../components/SiteLink'
import { byRegion, priceRanges } from '../lib/catalog'
import { formatCompactPrice, formatPrice } from '../lib/format'
import styles from './Neighborhoods.module.css'

const VB_W = 600
const VB_H = 420
/** Rótulos à esquerda do ponto, para não colidirem no agrupamento da capital nem saírem do mapa. */
const LABEL_LEFT = new Set(['alto-de-pinheiros', 'jardim-europa', 'riviera', 'campos-do-jordao'])

export function SchematicMap({
  selected,
  onSelect,
  counts,
}: {
  selected: string
  onSelect: (id: string) => void
  counts: Record<string, number>
}) {
  return (
    <div className={styles.map}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={styles.svg} aria-hidden="true" focusable="false">
        <path className={styles.sea} d="M0 404 C120 398 240 386 318 352 C380 326 430 310 498 306 C548 303 580 296 600 288 L600 420 L0 420 Z" />
        <path className={styles.coast} d="M0 404 C120 398 240 386 318 352 C380 326 430 310 498 306 C548 303 580 296 600 288" />
        <path className={styles.island} d="M512 330 C520 316 548 314 560 326 C570 338 560 356 540 358 C522 360 506 346 512 330 Z" />
        <g className={styles.contours}>
          <path d="M410 70 C430 30 520 26 548 60 C570 90 540 124 486 122 C440 120 400 104 410 70 Z" />
          <path d="M432 72 C446 46 510 44 528 66 C542 86 520 108 484 106 C454 104 424 94 432 72 Z" />
          <path d="M452 74 C462 60 500 58 510 72 C518 84 504 96 484 94 C466 92 448 86 452 74 Z" />
        </g>
        <path className={styles.cityShape} d="M168 140 C190 112 268 112 304 150 C330 178 318 238 286 250 C250 262 196 252 176 226 C156 200 150 162 168 140 Z" />
        <g className={styles.roads}>
          <path d="M190 200 C150 220 110 244 70 262" />
          <path d="M270 236 C300 280 340 310 372 336" />
          <path d="M290 176 C340 140 420 110 476 72" />
          <path d="M372 336 C420 330 470 330 528 330" />
        </g>
        <text x="150" y="104" className={styles.label}>
          São Paulo
        </text>
        <text x="420" y="398" className={styles.label}>
          Oceano Atlântico
        </text>
        <text x="410" y="150" className={styles.label}>
          Serra da Mantiqueira
        </text>
      </svg>

      {REGIONS.map((r) => {
        const isSel = r.id === selected
        const n = counts[r.id] ?? 0
        return (
          <button
            key={r.id}
            type="button"
            className={`${styles.node} ${isSel ? styles.nodeActive : ''} ${LABEL_LEFT.has(r.id) ? styles.flip : ''}`}
            style={{ left: `${(r.mapX / VB_W) * 100}%`, top: `${(r.mapY / VB_H) * 100}%` }}
            aria-pressed={isSel}
            aria-label={`${r.name}: ${n} ${n === 1 ? 'imóvel' : 'imóveis'}`}
            onClick={() => onSelect(r.id)}
          >
            <span className={styles.dot} aria-hidden="true">
              {n}
            </span>
            <span className={styles.nodeLabel} aria-hidden="true">
              {r.name}
            </span>
          </button>
        )
      })}
      <p className={styles.mapNote}>Mapa esquemático, fora de escala.</p>
    </div>
  )
}

export function Neighborhoods() {
  const [selected, setSelected] = useState('alto-de-pinheiros')
  const reduce = useReducedMotion()
  const counts = useMemo(() => Object.fromEntries(REGIONS.map((r) => [r.id, byRegion(r.id).length])), [])
  const region = REGIONS.find((r) => r.id === selected) ?? REGIONS[0]
  const items = byRegion(region.id, PROPERTIES)
  const ranges = priceRanges(items)

  return (
    <section className={`section ${styles.section}`} aria-labelledby="hoods-title">
      <div className="container">
        <header className={styles.head}>
          <TextReveal id="hoods-title" lines={['Explore', 'por região']} className="display-l" />
          <p className="lead">Da capital à serra e ao litoral. Escolha uma região para ver o perfil, os imóveis disponíveis no catálogo e a faixa de preços.</p>
        </header>

        <div className={styles.chips} role="group" aria-label="Regiões">
          {REGIONS.map((r) => (
            <button key={r.id} type="button" className="chip" aria-pressed={r.id === selected} onClick={() => setSelected(r.id)}>
              {r.name}
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          <SchematicMap selected={selected} onSelect={setSelected} counts={counts} />

          <div className={styles.panel} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={region.id}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={styles.panelInner}
              >
                <p className={styles.city}>
                  {region.city}, {region.state}
                </p>
                <h3 className="display-m">{region.name}</h3>
                <p className={styles.profile}>{region.profile}</p>
                <ul className={styles.traits}>
                  {region.traits.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <dl className={styles.stats}>
                  <div>
                    <dt>No catálogo</dt>
                    <dd>
                      {items.length} {items.length === 1 ? 'imóvel' : 'imóveis'}
                    </dd>
                  </div>
                  {ranges.map((r) => (
                    <div key={r.purpose}>
                      <dt>{PURPOSE_LABEL[r.purpose]}</dt>
                      <dd className="tabular">
                        {r.min === r.max ? formatCompactPrice(r.min) : `${formatCompactPrice(r.min)} a ${formatCompactPrice(r.max)}`}
                        {r.purpose === 'aluguel' ? '/mês' : ''}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className={styles.list}>
                  {items.map((p) => (
                    <li key={p.id} data-card>
                      <SiteLink to={`/imoveis/${p.slug}`} className={styles.row} onClick={markHeroTransition}>
                        <Img src={p.photos[0].id} alt="" sizes="88px" maxWidth={480} className={styles.rowImg} />
                        <span className={styles.rowText}>
                          <span className={styles.rowTitle}>{p.title}</span>
                          <span className="meta tabular">{formatPrice(p.price, p.purpose)}</span>
                        </span>
                      </SiteLink>
                    </li>
                  ))}
                </ul>

                <SiteLink to={`/imoveis?regiao=${region.id}`} className="btn btn--ghost">
                  Ver imóveis em {region.name}
                </SiteLink>
                <p className={styles.disclaimer}>Faixas calculadas apenas sobre os imóveis deste catálogo demonstrativo. Não representam dados de mercado.</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
