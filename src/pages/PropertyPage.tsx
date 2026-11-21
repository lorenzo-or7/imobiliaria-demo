import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
  Dumbbell,
  Expand,
  Flame,
  Leaf,
  Images,
  Laptop,
  PawPrint,
  Ruler,
  Share2,
  ShieldCheck,
  Sofa,
  Sun,
  Trees,
  Waves,
  Mountain,
  Sunrise,
  Droplets,
  type LucideIcon,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { FEATURE_LABEL, PURPOSE_LABEL, TYPE_LABEL } from '../data/catalog'
import { getPropertyBySlug } from '../data/properties'
import { photoUrl } from '../data/photos'
import { REGION_BY_ID, regionPlace } from '../data/regions'
import type { FeatureKey } from '../data/types'
import { ContactForm, interestMessage } from '../components/ContactForm'
import { EmptyState } from '../components/EmptyState'
import { FloorPlans } from '../components/FloorPlans'
import { Img } from '../components/Img'
import { Lightbox, scopeLabel } from '../components/Lightbox'
import { MapEmbed } from '../components/MapEmbed'
import { TextReveal } from '../components/motion'
import { PropertyCard } from '../components/PropertyCard'
import { CompareButton, FavoriteButton } from '../components/SavedButtons'
import { SiteLink } from '../components/SiteLink'
import { copyText, WhatsAppButton } from '../components/WhatsAppDialog'
import { useSeo } from '../hooks/useSeo'
import { similarTo } from '../lib/catalog'
import { formatArea, formatCurrency, formatPrice, pricePerSquareMeter } from '../lib/format'
import { useToast } from '../state/toast'
import styles from './PropertyPage.module.css'

const FEATURE_ICON: Record<FeatureKey, LucideIcon> = {
  piscina: Droplets,
  jardim: Trees,
  varanda: Sunrise,
  'vista-mar': Waves,
  'vista-panoramica': Mountain,
  'home-office': Laptop,
  'aceita-pet': PawPrint,
  mobiliado: Sofa,
  academia: Dumbbell,
  lareira: Flame,
  'energia-solar': Sun,
  'portaria-24h': ShieldCheck,
}

export default function PropertyPage() {
  const { slug } = useParams()
  const p = getPropertyBySlug(slug)
  const reduce = useReducedMotion()
  const { notify } = useToast()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [showBar, setShowBar] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress, scrollY } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 })

  useMotionValueEvent(scrollY, 'change', (y) => {
    const h = heroRef.current?.offsetHeight ?? 600
    setShowBar(y > h * 0.8)
  })

  useSeo(
    p ? p.title : 'Imóvel não encontrado',
    p ? `${p.tagline} ${TYPE_LABEL[p.type]} para ${PURPOSE_LABEL[p.purpose].toLowerCase()} em ${REGION_BY_ID[p.regionId]?.name}.` : 'O imóvel procurado não está no catálogo.',
    p ? photoUrl(p.photos[0].id, 1200) : undefined,
  )

  if (!p) {
    return (
      <div className="container section" style={{ paddingTop: 'clamp(120px, 14vw, 176px)' }}>
        <EmptyState
          title="Este imóvel não está mais no catálogo"
          actions={
            <SiteLink to="/imoveis" className="btn btn--primary">
              Ver imóveis disponíveis
            </SiteLink>
          }
        >
          <p>Ele pode ter sido retirado ou o endereço está incompleto.</p>
        </EmptyState>
      </div>
    )
  }

  const region = REGION_BY_ID[p.regionId]
  const similar = similarTo(p)
  const hero = p.photos[0]
  const ownCount = p.photos.filter((ph) => ph.scope === 'imovel').length
  const refCount = p.photos.length - ownCount

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: p.title, text: `${p.title}: ${p.tagline}`, url })
        return
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return
      }
    }
    const ok = await copyText(url)
    notify(ok ? 'Link do imóvel copiado.' : 'Não foi possível copiar. Copie o endereço na barra do navegador.', { tone: ok ? 'success' : 'error' })
  }

  const scrollToForm = () => {
    const el = document.getElementById('interesse')
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(() => el?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), reduce ? 0 : 600)
  }

  const specs: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Ruler, label: 'Área construída', value: formatArea(p.area) },
    ...(p.landArea ? [{ icon: Expand, label: 'Terreno', value: formatArea(p.landArea) }] : []),
    { icon: BedDouble, label: p.bedrooms === 1 ? 'Quarto' : 'Quartos', value: String(p.bedrooms) },
    { icon: Leaf, label: p.suites === 1 ? 'Suíte' : 'Suítes', value: String(p.suites) },
    { icon: Bath, label: p.bathrooms === 1 ? 'Banheiro' : 'Banheiros', value: String(p.bathrooms) },
    { icon: Car, label: p.parking === 1 ? 'Vaga' : 'Vagas', value: String(p.parking) },
  ]

  return (
    <article className={styles.page}>
      <motion.div className={styles.progress} style={{ scaleX: progress }} aria-hidden="true" />

      <div ref={heroRef} className={styles.hero}>
        <button type="button" className={styles.heroBtn} onClick={() => setLightbox(0)} aria-label={`Abrir galeria: ${hero.caption}`}>
          <Img src={hero.id} alt={hero.alt} sizes="100vw" priority className={styles.heroImg} style={{ viewTransitionName: 'property-hero' }} />
        </button>
        <span className={styles.heroTag}>{scopeLabel(hero)}</span>
      </div>

      <div className={`container ${styles.intro}`}>
        <nav aria-label="Trilha de navegação" className={styles.crumbs}>
          <ol>
            <li>
              <SiteLink to="/imoveis">Imóveis</SiteLink>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li>
              <SiteLink to={`/imoveis?regiao=${p.regionId}`}>{region?.name}</SiteLink>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li aria-current="page">{p.title}</li>
          </ol>
        </nav>

        <div className={styles.titleRow}>
          <div className={styles.titleBlock}>
            <p className={styles.where}>
              {TYPE_LABEL[p.type]} para {PURPOSE_LABEL[p.purpose].toLowerCase()}, {regionPlace(region)}
            </p>
            <TextReveal as="h1" lines={[p.title]} className="display-l" trigger="mount" delay={0.15} />
            <p className="lead">{p.tagline}</p>
          </div>
          <div className={styles.priceBlock}>
            <p className={styles.priceLabel}>{p.purpose === 'aluguel' ? 'Aluguel mensal' : 'Valor de venda'}</p>
            <p className={`${styles.price} tabular`}>{formatPrice(p.price, p.purpose)}</p>
            <p className="meta tabular">
              {p.condo ? `Condomínio ${formatCurrency(p.condo)}/mês` : 'Sem condomínio'}
              {p.iptu ? `, IPTU ${formatCurrency(p.iptu)}/ano` : ''}
            </p>
            <div className={styles.actions}>
              <FavoriteButton property={p} variant="inline" />
              <CompareButton property={p} />
              <button type="button" className={`btn btn--ghost ${styles.share}`} onClick={share}>
                <Share2 size={16} aria-hidden="true" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>

        <ul className={styles.specs}>
          {specs.map((s) => (
            <li key={s.label}>
              <s.icon size={18} aria-hidden="true" className={styles.specIcon} />
              <span className={`${styles.specValue} tabular`}>{s.value}</span>
              <span className={styles.specLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`container ${styles.body}`}>
        <div className={styles.main}>
          <section aria-labelledby="galeria" className={styles.block}>
            <div className={styles.blockHead}>
              <h2 id="galeria" className="display-s">
                Galeria
              </h2>
              <button type="button" className="text-link" onClick={() => setLightbox(0)}>
                <Images size={16} aria-hidden="true" />
                Ver as {p.photos.length} imagens em tela cheia
              </button>
            </div>
            <ul className={`${styles.mosaic} ${styles[`m${Math.min(p.photos.length, 5)}`]}`}>
              {p.photos.slice(0, 5).map((ph, i) => (
                <li key={ph.id + i}>
                  <button type="button" className={styles.tile} onClick={() => setLightbox(i)} aria-label={`Abrir imagem ${i + 1}: ${ph.caption}`}>
                    <Img src={ph.id} alt={ph.alt} sizes={i === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 1024px) 20vw, 50vw'} maxWidth={1920} />
                    <span className={`${styles.tileTag} ${ph.scope === 'referencia' ? styles.tileRef : ''}`}>{ph.scope === 'imovel' ? 'Imóvel' : 'Referência'}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.photoNote}>
              {ownCount === 1 ? 'A primeira imagem mostra o imóvel.' : `As ${ownCount} primeiras imagens mostram o imóvel.`}
              {refCount > 0 && ` As demais (${refCount}) são referências de ambientação de outros espaços e estão marcadas como tal.`}
            </p>
          </section>

          <section aria-labelledby="sobre" className={styles.block}>
            <h2 id="sobre" className="display-s">
              Sobre o imóvel
            </h2>
            <div className={styles.prose}>
              {p.description.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <div className={styles.archi}>
              <h3 className={styles.h3}>Arquitetura e materiais</h3>
              <p>{p.architecture}</p>
            </div>
          </section>

          <section aria-labelledby="comodidades" className={styles.block}>
            <h2 id="comodidades" className="display-s">
              Comodidades
            </h2>
            <ul className={styles.features}>
              {p.features.map((f) => {
                const Icon = FEATURE_ICON[f]
                return (
                  <li key={f}>
                    <Icon size={20} aria-hidden="true" />
                    {FEATURE_LABEL[f]}
                  </li>
                )
              })}
            </ul>
          </section>

          {p.floorPlans.length > 0 && (
            <section aria-labelledby="planta" className={styles.block}>
              <h2 id="planta" className="display-s">
                Planta
              </h2>
              <FloorPlans plans={p.floorPlans} title={p.title} />
            </section>
          )}

          {region && (
            <section aria-labelledby="localizacao" className={styles.block}>
              <h2 id="localizacao" className="display-s">
                Localização
              </h2>
              <p className={styles.regionText}>{region.profile}</p>
              <MapEmbed region={region} />
            </section>
          )}

          <section aria-labelledby="info" className={styles.block}>
            <h2 id="info" className="display-s">
              Informações complementares
            </h2>
            <dl className={styles.info}>
              <div>
                <dt>Código</dt>
                <dd>{p.id}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{TYPE_LABEL[p.type]}</dd>
              </div>
              <div>
                <dt>Finalidade</dt>
                <dd>{PURPOSE_LABEL[p.purpose]}</dd>
              </div>
              <div>
                <dt>Ano de construção</dt>
                <dd>{p.yearBuilt ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt>Preço por m²</dt>
                <dd className="tabular">
                  {formatCurrency(Math.round(pricePerSquareMeter(p)))}
                  {p.purpose === 'aluguel' ? '/mês' : ''}
                </dd>
              </div>
              <div>
                <dt>Condomínio</dt>
                <dd className="tabular">{p.condo ? `${formatCurrency(p.condo)}/mês` : 'Não há'}</dd>
              </div>
              <div>
                <dt>IPTU</dt>
                <dd className="tabular">{p.iptu ? `${formatCurrency(p.iptu)}/ano` : 'Não informado'}</dd>
              </div>
              <div>
                <dt>Disponibilidade</dt>
                <dd>Imóvel fictício, sem disponibilidade real</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className={styles.aside} aria-label="Agendar ou pedir informações">
          <div className={styles.asideCard}>
            <p className={styles.priceLabel}>{p.purpose === 'aluguel' ? 'Aluguel mensal' : 'Valor de venda'}</p>
            <p className={`${styles.asidePrice} tabular`}>{formatPrice(p.price, p.purpose)}</p>
            <SiteLink to={`/agendar?imovel=${p.slug}`} className="btn btn--primary">
              <CalendarDays size={18} aria-hidden="true" />
              Agendar visita
            </SiteLink>
            <button type="button" className="btn btn--ghost" onClick={scrollToForm}>
              Pedir informações
            </button>
            <WhatsAppButton message={interestMessage(p)} />
            <ul className={styles.asideList}>
              <li>
                <Check size={16} aria-hidden="true" />
                Visita acompanhada por especialista da região
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                Resposta em horário comercial
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section id="interesse" className={`section ${styles.interest}`} aria-labelledby="interesse-title">
        <div className={`container ${styles.interestGrid}`}>
          <div>
            <h2 id="interesse-title" className="display-m">
              Quer saber mais sobre a {p.title}?
            </h2>
            <p className="lead">Deixe seu contato. A mensagem já vem preenchida com o código do imóvel, e você pode editar à vontade.</p>
          </div>
          <ContactForm property={p} submitLabel="Enviar interesse" />
        </div>
      </section>

      <section className="section" aria-labelledby="similares">
        <div className="container">
          <div className={styles.blockHead}>
            <h2 id="similares" className="display-m">
              Imóveis semelhantes
            </h2>
            <SiteLink to={`/imoveis?finalidade=${p.purpose}`} className="text-link">
              Ver mais para {PURPOSE_LABEL[p.purpose].toLowerCase()}
            </SiteLink>
          </div>
          <ul className={styles.similar}>
            {similar.map((s) => (
              <li key={s.id}>
                <PropertyCard property={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <motion.div
        className={styles.bar}
        initial={false}
        animate={showBar ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div className={styles.barText}>
          <span className={styles.barTitle}>{p.title}</span>
          <span className="tabular">{formatPrice(p.price, p.purpose)}</span>
        </div>
        <SiteLink to={`/agendar?imovel=${p.slug}`} className="btn btn--primary btn--small">
          Agendar visita
        </SiteLink>
      </motion.div>

      <Lightbox photos={p.photos} index={lightbox} onIndex={setLightbox} title={p.title} />
    </article>
  )
}
