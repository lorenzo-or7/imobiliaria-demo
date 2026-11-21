import { useState } from 'react'
import type { FloorPlan } from '../data/types'
import styles from './FloorPlans.module.css'

const KIND_LABEL = { social: 'Social', intimo: 'Íntimo', servico: 'Serviço', externo: 'Área externa' } as const

/** Planta ilustrativa desenhada a partir dos dados do imóvel. Sem escala. */
export function FloorPlans({ plans, title }: { plans: FloorPlan[]; title: string }) {
  const [active, setActive] = useState(0)
  const plan = plans[active]
  if (!plan) return null
  const pad = 2
  return (
    <div className={styles.wrap}>
      {plans.length > 1 && (
        <div className="segmented" role="group" aria-label="Pavimento">
          {plans.map((p, i) => (
            <button key={p.label} type="button" aria-pressed={i === active} onClick={() => setActive(i)}>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <figure className={styles.figure}>
        <svg viewBox={`${-pad} ${-pad} ${plan.width + pad * 2} ${plan.height + pad * 2}`} className={styles.svg} role="img" aria-label={`Planta ilustrativa de ${title}, ${plan.label}: ${plan.rooms.map((r) => r.name).join(', ')}`}>
          <rect x={0} y={0} width={plan.width} height={plan.height} className={styles.outline} />
          {plan.rooms.map((r, i) => (
            <g key={`${r.name}-${i}`}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} className={`${styles.room} ${styles[r.kind ?? 'social']}`} />
              <text x={r.x + r.w / 2} y={r.y + r.h / 2} className={styles.label} textAnchor="middle" dominantBaseline="middle">
                {r.name}
              </text>
            </g>
          ))}
        </svg>
        <figcaption className={styles.caption}>
          <span>Planta ilustrativa, sem escala.</span>
          <span className={styles.legend}>
            {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => (
              <span key={k}>
                <i className={styles[k]} aria-hidden="true" />
                {KIND_LABEL[k]}
              </span>
            ))}
          </span>
        </figcaption>
      </figure>
    </div>
  )
}
