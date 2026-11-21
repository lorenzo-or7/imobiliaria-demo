import { useId } from 'react'
import { FEATURE_LABEL, FEATURE_ORDER, PURPOSE_ACTION, TYPE_LABEL, TYPE_ORDER } from '../data/catalog'
import { REGIONS } from '../data/regions'
import { AREA_STEPS, BEDROOM_STEPS, PRICE_STEPS, toggleItem, withPurpose, type Filters, type PurposeFilter } from '../lib/filters'
import { formatArea, formatCompactPrice } from '../lib/format'
import styles from './FilterControls.module.css'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  variant: 'finder' | 'panel'
  showFeatures?: boolean
}

const PURPOSES: { value: PurposeFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'venda', label: PURPOSE_ACTION.venda },
  { value: 'aluguel', label: PURPOSE_ACTION.aluguel },
]

export function FilterControls({ filters: f, onChange, variant, showFeatures = true }: Props) {
  const uid = useId()
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch })
  const priceSteps = f.purpose === 'todos' ? [] : PRICE_STEPS[f.purpose]
  const purposes = variant === 'finder' ? PURPOSES.filter((p) => p.value !== 'todos') : PURPOSES

  return (
    <div className={`${styles.root} ${styles[variant]}`}>
      <fieldset className={`${styles.group} ${styles.purpose}`}>
        <legend className={styles.legend}>Finalidade</legend>
        <div className="segmented" role="group" aria-label="Finalidade">
          {purposes.map((p) => (
            <button key={p.value} type="button" aria-pressed={f.purpose === p.value} onClick={() => onChange(withPurpose(f, p.value))}>
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      {variant === 'finder' ? (
        <div className={`field ${styles.group}`}>
          <label className="field__label" htmlFor={`${uid}-region`}>
            Cidade ou região
          </label>
          <select
            id={`${uid}-region`}
            className="select"
            value={f.regions[0] ?? ''}
            onChange={(e) => set({ regions: e.target.value ? [e.target.value] : [] })}
          >
            <option value="">Todas as regiões</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.city !== r.name ? `, ${r.city}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Região</legend>
          <div className={styles.chips}>
            {REGIONS.map((r) => (
              <button key={r.id} type="button" className="chip" aria-pressed={f.regions.includes(r.id)} onClick={() => set({ regions: toggleItem(f.regions, r.id) })}>
                {r.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Tipo de imóvel</legend>
        <div className={styles.chips}>
          {TYPE_ORDER.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={f.types.includes(t)} onClick={() => set({ types: toggleItem(f.types, t) })}>
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Faixa de preço{f.purpose === 'aluguel' ? ' mensal' : ''}</legend>
        <div className={styles.pair}>
          <div className="field">
            <label className="visually-hidden" htmlFor={`${uid}-pmin`}>
              Preço mínimo
            </label>
            <select
              id={`${uid}-pmin`}
              className="select"
              disabled={f.purpose === 'todos'}
              value={f.priceMin ?? ''}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null
                set({ priceMin: v, priceMax: v !== null && f.priceMax !== null && f.priceMax < v ? null : f.priceMax })
              }}
            >
              <option value="">Mínimo</option>
              {priceSteps.map((v) => (
                <option key={v} value={v}>
                  {formatCompactPrice(v)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="visually-hidden" htmlFor={`${uid}-pmax`}>
              Preço máximo
            </label>
            <select
              id={`${uid}-pmax`}
              className="select"
              disabled={f.purpose === 'todos'}
              value={f.priceMax ?? ''}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null
                set({ priceMax: v, priceMin: v !== null && f.priceMin !== null && f.priceMin > v ? null : f.priceMin })
              }}
            >
              <option value="">Máximo</option>
              {priceSteps.map((v) => (
                <option key={v} value={v}>
                  {formatCompactPrice(v)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {f.purpose === 'todos' && <p className="field__hint">Escolha comprar ou alugar para filtrar por preço.</p>}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Quartos</legend>
        <div className="segmented" role="group" aria-label="Quantidade mínima de quartos">
          <button type="button" aria-pressed={f.bedrooms === 0} onClick={() => set({ bedrooms: 0 })}>
            Qualquer
          </button>
          {BEDROOM_STEPS.map((n) => (
            <button key={n} type="button" aria-pressed={f.bedrooms === n} onClick={() => set({ bedrooms: n })} aria-label={`${n} ou mais quartos`}>
              {n}+
            </button>
          ))}
        </div>
      </fieldset>

      <div className={`field ${styles.group}`}>
        <label className={styles.legend} htmlFor={`${uid}-area`}>
          Área mínima
        </label>
        <select id={`${uid}-area`} className="select" value={f.areaMin ?? ''} onChange={(e) => set({ areaMin: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Qualquer área</option>
          {AREA_STEPS.map((a) => (
            <option key={a} value={a}>
              A partir de {formatArea(a)}
            </option>
          ))}
        </select>
      </div>

      {showFeatures && (
        <fieldset className={`${styles.group} ${styles.features}`}>
          <legend className={styles.legend}>Características</legend>
          <div className={styles.chips}>
            {FEATURE_ORDER.map((feat) => (
              <button key={feat} type="button" className="chip" aria-pressed={f.features.includes(feat)} onClick={() => set({ features: toggleItem(f.features, feat) })}>
                {FEATURE_LABEL[feat]}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
