import { Check, Info, Minus, Plus, X } from 'lucide-react'
import { FEATURE_LABEL, FEATURE_ORDER, PURPOSE_LABEL, TYPE_LABEL } from '../data/catalog'
import { PROPERTY_BY_ID } from '../data/properties'
import { REGION_BY_ID, regionPlace } from '../data/regions'
import type { Property } from '../data/types'
import { EmptyState } from '../components/EmptyState'
import { Img } from '../components/Img'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import { compareHighlights, type CompareMetric } from '../lib/catalog'
import { formatArea, formatCurrency, formatPrice, pricePerSquareMeter } from '../lib/format'
import { COMPARE_LIMIT, useSaved } from '../state/saved'
import { useToast } from '../state/toast'
import shared from './shared.module.css'
import styles from './Compare.module.css'

const HIGHLIGHT_LABEL: Record<CompareMetric, string> = {
  price: 'Menor preço',
  ppsm: 'Menor preço por m²',
  area: 'Maior área',
  bedrooms: 'Mais quartos',
  suites: 'Mais suítes',
  bathrooms: 'Mais banheiros',
  parking: 'Mais vagas',
}

interface Row {
  key: string
  label: string
  metric?: CompareMetric
  render: (p: Property) => React.ReactNode
}

export default function Compare() {
  useSeo('Comparar imóveis', 'Compare até três imóveis lado a lado: preço, área, preço por metro quadrado, quartos, suítes, vagas e características.')
  const { compare, removeCompare, favorites, toggleCompare } = useSaved()
  const { notify } = useToast()
  const items = compare.map((id) => PROPERTY_BY_ID[id]).filter(Boolean)
  const highlights = compareHighlights(items)
  const mixed = items.length > 1 && !items.every((p) => p.purpose === items[0].purpose)
  const candidates = favorites.filter((id) => !compare.includes(id)).map((id) => PROPERTY_BY_ID[id]).filter(Boolean)
  const featureUnion = FEATURE_ORDER.filter((f) => items.some((p) => p.features.includes(f)))

  const add = (p: Property) => {
    const r = toggleCompare(p.id)
    if (r === 'full') notify(`A comparação aceita até ${COMPARE_LIMIT} imóveis.`, { tone: 'error' })
    else notify(`${p.title} entrou na comparação.`, { tone: 'success' })
  }

  const rows: Row[] = [
    { key: 'price', label: 'Preço', metric: 'price', render: (p) => formatPrice(p.price, p.purpose) },
    { key: 'area', label: 'Área construída', metric: 'area', render: (p) => formatArea(p.area) },
    {
      key: 'ppsm',
      label: 'Preço por m²',
      metric: 'ppsm',
      render: (p) => `${formatCurrency(Math.round(pricePerSquareMeter(p)))}${p.purpose === 'aluguel' ? '/mês' : ''}`,
    },
    { key: 'bedrooms', label: 'Quartos', metric: 'bedrooms', render: (p) => p.bedrooms },
    { key: 'suites', label: 'Suítes', metric: 'suites', render: (p) => p.suites },
    { key: 'bathrooms', label: 'Banheiros', metric: 'bathrooms', render: (p) => p.bathrooms },
    { key: 'parking', label: 'Vagas', metric: 'parking', render: (p) => p.parking },
    { key: 'type', label: 'Tipo e finalidade', render: (p) => `${TYPE_LABEL[p.type]}, ${PURPOSE_LABEL[p.purpose].toLowerCase()}` },
    {
      key: 'loc',
      label: 'Localização',
      render: (p) => {
        const r = REGION_BY_ID[p.regionId]
        return regionPlace(r)
      },
    },
    { key: 'condo', label: 'Condomínio', render: (p) => (p.condo ? `${formatCurrency(p.condo)}/mês` : 'Não há') },
  ]

  const cols = items.length

  return (
    <div className={`container page-top ${shared.page}`}>
      <header className={shared.header}>
        <h1 className="display-xl">Comparar</h1>
        <div>
          <p className="lead">Até {COMPARE_LIMIT} imóveis lado a lado. Os destaques indicam apenas o maior ou menor valor de cada linha, sem notas ou rankings.</p>
        </div>
      </header>

      {items.length < 2 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            title={items.length === 0 ? 'Escolha dois ou três imóveis' : 'Falta pelo menos mais um imóvel'}
            actions={
              <SiteLink to="/imoveis" className="btn btn--primary">
                Escolher no catálogo
              </SiteLink>
            }
          >
            <p>Use o botão “Comparar” nos imóveis do catálogo ou dos seus favoritos. A seleção fica salva neste navegador.</p>
            {items.length === 1 && (
              <p className={styles.current}>
                Já escolhido: <strong>{items[0].title}</strong>{' '}
                <button type="button" className="text-link" onClick={() => removeCompare(items[0].id)}>
                  Remover
                </button>
              </p>
            )}
          </EmptyState>
          {candidates.length > 0 && (
            <section className={styles.candidates} aria-labelledby="cand-title">
              <h2 id="cand-title" className="display-s">
                Dos seus favoritos
              </h2>
              <ul>
                {candidates.map((p) => (
                  <li key={p.id}>
                    <Img src={p.photos[0].id} alt="" sizes="96px" maxWidth={480} />
                    <span className={styles.candName}>{p.title}</span>
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => add(p)} disabled={compare.length >= COMPARE_LIMIT}>
                      <Plus size={16} aria-hidden="true" />
                      Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <>
          {mixed && (
            <p className={`demo-note ${styles.mixed}`}>
              <Info size={16} aria-hidden="true" />
              <span>Você está comparando imóveis para venda e para aluguel. Por isso, preço e preço por m² não recebem destaque.</span>
            </p>
          )}
          <div className={styles.tableWrap}>
            <table className={styles.table} style={{ '--cols': cols } as React.CSSProperties}>
              <caption className="visually-hidden">Comparação entre {items.map((p) => p.title).join(', ')}</caption>
              <thead>
                <tr>
                  <td className={styles.corner}>
                    {cols < COMPARE_LIMIT && (
                      <SiteLink to="/imoveis" className={styles.addLink}>
                        <Plus size={16} aria-hidden="true" />
                        Adicionar imóvel
                      </SiteLink>
                    )}
                  </td>
                  {items.map((p) => (
                    <th key={p.id} scope="col" className={styles.head}>
                      <div className={styles.headInner}>
                        <SiteLink to={`/imoveis/${p.slug}`} className={styles.headImg} tabIndex={-1} aria-hidden="true">
                          <Img src={p.photos[0].id} alt="" sizes="(min-width: 900px) 25vw, 33vw" maxWidth={1080} />
                        </SiteLink>
                        <SiteLink to={`/imoveis/${p.slug}`} className={styles.headTitle}>
                          {p.title}
                        </SiteLink>
                        <button type="button" className={styles.remove} onClick={() => removeCompare(p.id)} aria-label={`Remover ${p.title} da comparação`}>
                          <X size={14} aria-hidden="true" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const winners = row.metric ? highlights[row.metric] ?? [] : []
                  return (
                    <RowGroup key={row.key} label={row.label} cols={cols}>
                      {items.map((p) => {
                        const win = winners.includes(p.id)
                        return (
                          <td key={p.id} className={`${styles.cell} ${win ? styles.win : ''}`}>
                            <span className="tabular">{row.render(p)}</span>
                            {win && row.metric && <span className={styles.badge}>{HIGHLIGHT_LABEL[row.metric]}</span>}
                          </td>
                        )
                      })}
                    </RowGroup>
                  )
                })}
                {featureUnion.map((f) => (
                  <RowGroup key={f} label={FEATURE_LABEL[f]} cols={cols}>
                    {items.map((p) => {
                      const has = p.features.includes(f)
                      return (
                        <td key={p.id} className={`${styles.cell} ${styles.feat}`}>
                          {has ? <Check size={18} aria-label="Sim" className={styles.yes} /> : <Minus size={18} aria-label="Não" className={styles.no} />}
                        </td>
                      )
                    })}
                  </RowGroup>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.footer}>
            {items.map((p) => (
              <SiteLink key={p.id} to={`/agendar?imovel=${p.slug}`} className="btn btn--ghost btn--small">
                Agendar visita: {p.title}
              </SiteLink>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Em telas estreitas, o rótulo vira uma linha própria para liberar largura às colunas. */
function RowGroup({ label, cols, children }: { label: string; cols: number; children: React.ReactNode }) {
  return (
    <>
      <tr className={styles.labelRow}>
        <th scope="colgroup" colSpan={cols + 1}>
          {label}
        </th>
      </tr>
      <tr className={styles.row}>
        <th scope="row" className={styles.rowLabel}>
          {label}
        </th>
        {children}
      </tr>
    </>
  )
}
