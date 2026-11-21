import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CalendarDays, Heart, MessageCircle, Search } from 'lucide-react'
import { PROPERTIES } from '../data/properties'
import { Img } from '../components/Img'
import { TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { BASE_SLOTS } from '../lib/schedule'
import { formatCompactPrice } from '../lib/format'
import styles from './Journey.module.css'

const STEPS = [
  {
    title: 'Explore propriedades',
    text: 'Busque por região, tamanho e características. Filtros combinados mostram na hora quantos imóveis restam.',
    cta: { to: '/imoveis', label: 'Abrir o catálogo' },
    icon: Search,
  },
  {
    title: 'Encontre seu espaço',
    text: 'Salve favoritos e compare até três imóveis lado a lado: preço, área, preço por metro quadrado e características.',
    cta: { to: '/favoritos', label: 'Ver meus favoritos' },
    icon: Heart,
  },
  {
    title: 'Agende uma visita',
    text: 'Escolha o imóvel, o dia e o horário em seis passos curtos. Você revisa tudo antes de enviar.',
    cta: { to: '/agendar', label: 'Agendar visita' },
    icon: CalendarDays,
  },
  {
    title: 'Converse com um especialista',
    text: 'Tire dúvidas sobre documentação, financiamento e condições de locação com quem conhece o imóvel.',
    cta: { to: '/contato', label: 'Falar com a equipe' },
    icon: MessageCircle,
  },
]

function Preview({ step }: { step: number }) {
  const sample = PROPERTIES.slice(0, 6)
  if (step === 0)
    return (
      <div className={styles.pvGrid}>
        {sample.map((p) => (
          <div key={p.id} className={styles.pvCard}>
            <Img src={p.photos[0].id} alt="" sizes="160px" maxWidth={480} />
            <span>{p.title}</span>
          </div>
        ))}
      </div>
    )
  if (step === 1)
    return (
      <div className={styles.pvCompare}>
        {sample.slice(0, 3).map((p) => (
          <div key={p.id} className={styles.pvCol}>
            <Img src={p.photos[0].id} alt="" sizes="200px" maxWidth={480} />
            <strong>{p.title}</strong>
            <span>{formatCompactPrice(p.price)}</span>
            <span>{p.area} m²</span>
            <span>{p.suites} suítes</span>
          </div>
        ))}
      </div>
    )
  if (step === 2)
    return (
      <div className={styles.pvCal}>
        <div className={styles.pvDays}>
          {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((d, i) => (
            <span key={d} className={i === 2 ? styles.pvOn : ''}>
              {d}
              <b>{12 + i}</b>
            </span>
          ))}
        </div>
        <div className={styles.pvSlots}>
          {BASE_SLOTS.map((t, i) => (
            <span key={t} className={i === 3 ? styles.pvOn : i === 1 ? styles.pvOff : ''}>
              {t}
            </span>
          ))}
        </div>
      </div>
    )
  return (
    <div className={styles.pvChat}>
      <p className={styles.pvMsg}>Olá! Tenho interesse na Casa Jacarandá. Ela aceita permuta?</p>
      <p className={`${styles.pvMsg} ${styles.pvReply}`}>Olá! Podemos avaliar. Quer marcar uma conversa com a especialista da região?</p>
    </div>
  )
}

export function Journey() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % STEPS.length
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + STEPS.length) % STEPS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = STEPS.length - 1
    else return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  const step = STEPS[active]

  return (
    <section className={`section ${styles.section}`} aria-labelledby="journey-title">
      <div className="container">
        <header className={styles.head}>
          <TextReveal id="journey-title" lines={['Do primeiro clique', 'à chave na mão']} className="display-l" />
          <p className="lead">Quatro etapas, sempre com alguém disponível para ajudar. Escolha uma para ver como funciona.</p>
        </header>

        <div className={styles.layout}>
          <div role="tablist" aria-label="Etapas do atendimento" aria-orientation="vertical" className={styles.tabs}>
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                role="tab"
                id={`journey-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`journey-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.tabTitle}>{s.title}</span>
                {i === active && !reduce && <motion.span layoutId="journey-bar" className={styles.bar} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />}
                {i === active && reduce && <span className={styles.bar} />}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`journey-panel-${active}`} aria-labelledby={`journey-tab-${active}`} className={styles.panel}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className={styles.panelInner}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.preview} aria-hidden="true">
                  <Preview step={active} />
                </div>
                <div className={styles.copy}>
                  <step.icon size={22} aria-hidden="true" className={styles.icon} />
                  <p className={styles.text}>{step.text}</p>
                  <SiteLink to={step.cta.to} className="btn btn--primary">
                    {step.cta.label}
                  </SiteLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
