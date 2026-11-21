import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Check, CircleAlert, Info, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PURPOSE_LABEL } from '../data/catalog'
import { PROPERTIES, PROPERTY_BY_SLUG } from '../data/properties'
import { REGION_BY_ID } from '../data/regions'
import { Field } from '../components/Field'
import { Img } from '../components/Img'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import { formatPrice, normalizeText } from '../lib/format'
import { formatLongDate, formatMonth, formatWeekday, slotsFor, upcomingDays } from '../lib/schedule'
import { formatPhone, hasErrors, sanitizeText, validateContact, type ContactFields, type FieldErrors } from '../lib/validation'
import styles from './Schedule.module.css'

const STEPS = ['Imóvel', 'Data', 'Horário', 'Contato', 'Revisão', 'Confirmação'] as const
const CHANNELS = ['WhatsApp', 'Telefone', 'E-mail'] as const
type Channel = (typeof CHANNELS)[number]

interface Contact extends ContactFields {
  channel: Channel
  notes: string
}

const EMPTY_CONTACT: Contact = { name: '', email: '', phone: '', consent: false, channel: 'WhatsApp', notes: '' }

export default function Schedule() {
  useSeo('Agendar visita', 'Escolha o imóvel, a data e o horário da visita em poucos passos. Fluxo demonstrativo.')
  const [params] = useSearchParams()
  const preselected = PROPERTY_BY_SLUG[params.get('imovel') ?? '']
  const reduce = useReducedMotion()
  const [step, setStep] = useState(preselected ? 1 : 0)
  const [dir, setDir] = useState(1)
  const [slug, setSlug] = useState<string>(preselected?.slug ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT)
  const [contactErrors, setContactErrors] = useState<FieldErrors<Contact>>({})
  const [stepError, setStepError] = useState('')
  const [query, setQuery] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  const property = PROPERTY_BY_SLUG[slug]
  const [days] = useState(() => upcomingDays(new Date(), 21))
  const slots = property && date ? slotsFor(property.id, date) : []
  const filtered = PROPERTIES.filter((p) => {
    const q = normalizeText(query)
    if (!q) return true
    return normalizeText(`${p.title} ${REGION_BY_ID[p.regionId]?.name ?? ''}`).includes(q)
  })

  // Move o foco para o título de cada etapa (leitores de tela anunciam a mudança).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    const top = headingRef.current?.closest('section')?.getBoundingClientRect().top ?? 0
    if (top < 80) window.scrollTo({ top: window.scrollY + top - 120, behavior: reduce ? 'auto' : 'smooth' })
  }, [step, reduce])

  const goTo = (n: number) => {
    setDir(n > step ? 1 : -1)
    setStepError('')
    setStep(n)
  }

  const next = () => {
    if (step === 0 && !property) return setStepError('Escolha um imóvel para continuar.')
    if (step === 1 && !date) return setStepError('Escolha uma data para continuar.')
    if (step === 2 && !time) return setStepError('Escolha um horário para continuar.')
    if (step === 3) {
      const errs: FieldErrors<Contact> = validateContact(contact)
      setContactErrors(errs)
      if (hasErrors(errs)) {
        setStepError('Revise os campos destacados.')
        window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
        return
      }
    }
    goTo(step + 1)
  }

  const restart = () => {
    setSlug('')
    setDate('')
    setTime('')
    setContact(EMPTY_CONTACT)
    setContactErrors({})
    goTo(0)
  }

  const updateContact = <K extends keyof Contact>(key: K, value: Contact[K]) => {
    const nextC = { ...contact, [key]: value }
    setContact(nextC)
    if (contactErrors[key]) setContactErrors(validateContact(nextC))
  }

  const region = property ? REGION_BY_ID[property.regionId] : undefined

  return (
    <div className={`container page-top ${styles.page}`}>
      <header className={styles.header}>
        <h1 className="display-l">Agendar visita</h1>
        <p className="demo-note">
          <Info size={16} aria-hidden="true" />
          <span>Fluxo demonstrativo. Os horários são fictícios e nenhuma visita é marcada de verdade.</span>
        </p>
      </header>

      <nav aria-label="Etapas do agendamento" className={styles.stepsNav}>
        <ol className={styles.steps}>
          {STEPS.map((label, i) => {
            const done = i < step
            const canJump = done && step < 5
            return (
              <li key={label} className={`${styles.stepItem} ${i === step ? styles.current : ''} ${done ? styles.done : ''}`} aria-current={i === step ? 'step' : undefined}>
                {canJump ? (
                  <button type="button" onClick={() => goTo(i)} className={styles.stepBtn}>
                    <span className={styles.stepNum}>{done ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
                    <span className={styles.stepLabel}>{label}</span>
                    <span className="visually-hidden"> (concluída, voltar)</span>
                  </button>
                ) : (
                  <span className={styles.stepBtn}>
                    <span className={styles.stepNum}>{done ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
                    <span className={styles.stepLabel}>{label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        <div className={styles.bar} aria-hidden="true">
          <motion.span animate={{ scaleX: (step + 1) / STEPS.length }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </nav>

      <div className={styles.layout}>
        <section className={styles.stage} aria-labelledby="step-title">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -20 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={styles.stepBody}
            >
              <p className={styles.stepCount}>
                Etapa {step + 1} de {STEPS.length}
              </p>
              <h2 id="step-title" ref={headingRef} tabIndex={-1} className="display-s">
                {['Qual imóvel você quer visitar?', 'Escolha o dia', 'Escolha o horário', 'Como falamos com você?', 'Confira antes de enviar', 'Solicitação registrada'][step]}
              </h2>

              {step === 0 && (
                <div className={styles.pick}>
                  <div className={styles.search}>
                    <Search size={16} aria-hidden="true" />
                    <label htmlFor="sch-q" className="visually-hidden">
                      Filtrar imóveis por nome ou região
                    </label>
                    <input id="sch-q" className="input" type="search" placeholder="Filtrar por nome ou região" value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} />
                  </div>
                  <div role="radiogroup" aria-labelledby="step-title" className={styles.propList}>
                    {filtered.map((p) => (
                      <label key={p.id} className={`${styles.propOption} ${slug === p.slug ? styles.selected : ''}`}>
                        <input
                          type="radio"
                          name="imovel"
                          value={p.slug}
                          checked={slug === p.slug}
                          onChange={() => {
                            setSlug(p.slug)
                            setTime('')
                            setStepError('')
                          }}
                        />
                        <Img src={p.photos[0].id} alt="" sizes="80px" maxWidth={480} className={styles.propImg} />
                        <span className={styles.propText}>
                          <span className={styles.propTitle}>{p.title}</span>
                          <span className="meta">
                            {REGION_BY_ID[p.regionId]?.name}, {PURPOSE_LABEL[p.purpose].toLowerCase()}
                          </span>
                        </span>
                        <Check size={18} aria-hidden="true" className={styles.tick} />
                      </label>
                    ))}
                    {filtered.length === 0 && <p className="meta">Nenhum imóvel com esse nome. Tente o nome do bairro.</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div role="radiogroup" aria-labelledby="step-title" className={styles.days}>
                  {days.map((d) => (
                    <label key={d.iso} className={`${styles.day} ${date === d.iso ? styles.selected : ''} ${d.closed ? styles.disabled : ''}`}>
                      <input
                        type="radio"
                        name="data"
                        value={d.iso}
                        disabled={d.closed}
                        checked={date === d.iso}
                        onChange={() => {
                          setDate(d.iso)
                          setTime('')
                          setStepError('')
                        }}
                        aria-label={`${formatLongDate(d.iso)}${d.closed ? ', fechado' : ''}`}
                      />
                      <span className={styles.dayWeek}>{formatWeekday(d.date)}</span>
                      <span className={styles.dayNum}>{d.date.getDate()}</span>
                      <span className={styles.dayMonth}>{d.closed ? 'fechado' : formatMonth(d.date)}</span>
                    </label>
                  ))}
                </div>
              )}

              {step === 2 && (
                <>
                  <p className={styles.sub}>{formatLongDate(date)}. Horários demonstrativos, gerados para este protótipo.</p>
                  <div role="radiogroup" aria-labelledby="step-title" className={styles.slots}>
                    {slots.map((s) => (
                      <label key={s.time} className={`${styles.slot} ${time === s.time ? styles.selected : ''} ${!s.available ? styles.disabled : ''}`}>
                        <input
                          type="radio"
                          name="hora"
                          value={s.time}
                          disabled={!s.available}
                          checked={time === s.time}
                          onChange={() => {
                            setTime(s.time)
                            setStepError('')
                          }}
                          aria-label={`${s.time}${s.available ? '' : ', indisponível'}`}
                        />
                        <span className="tabular">{s.time}</span>
                        <span className={styles.slotState}>{s.available ? 'livre' : 'ocupado'}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <div className={styles.form}>
                  <div className={styles.row}>
                    <Field id="sch-name" label="Nome" error={contactErrors.name}>
                      {(a) => <input {...a} className="input" autoComplete="name" value={contact.name} onChange={(e) => updateContact('name', sanitizeText(e.target.value, 80))} />}
                    </Field>
                    <Field id="sch-email" label="E-mail" error={contactErrors.email}>
                      {(a) => (
                        <input {...a} className="input" type="email" autoComplete="email" inputMode="email" value={contact.email} onChange={(e) => updateContact('email', sanitizeText(e.target.value, 120))} />
                      )}
                    </Field>
                  </div>
                  <div className={styles.row}>
                    <Field id="sch-phone" label="Telefone" hint="Com DDD." error={contactErrors.phone}>
                      {(a) => (
                        <input {...a} className="input tabular" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="(11) 90000-0000" value={contact.phone} onChange={(e) => updateContact('phone', formatPhone(e.target.value))} />
                      )}
                    </Field>
                    <fieldset className={styles.channel}>
                      <legend className="field__label">Prefere ser contatado por</legend>
                      <div className="segmented" role="radiogroup" aria-label="Canal de contato preferido">
                        {CHANNELS.map((c) => (
                          <button key={c} type="button" role="radio" aria-checked={contact.channel === c} onClick={() => updateContact('channel', c)}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  <Field id="sch-notes" label="Observações" optional>
                    {(a) => <textarea {...a} className="textarea" rows={3} value={contact.notes} onChange={(e) => updateContact('notes', sanitizeText(e.target.value, 400))} placeholder="Ex.: vou com minha família e precisamos de vaga para visitante." />}
                  </Field>
                  <div className="field">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={contact.consent}
                        aria-invalid={Boolean(contactErrors.consent)}
                        aria-describedby={contactErrors.consent ? 'sch-consent-error' : undefined}
                        onChange={(e) => updateContact('consent', e.target.checked)}
                      />
                      <span>Li o aviso: meus dados servem só para organizar esta visita e não são compartilhados.</span>
                    </label>
                    {contactErrors.consent && (
                      <p className="field__error" id="sch-consent-error">
                        {contactErrors.consent}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && property && (
                <dl className={styles.review}>
                  {[
                    { label: 'Imóvel', value: `${property.title}, ${region?.name}`, edit: 0 },
                    { label: 'Data', value: formatLongDate(date), edit: 1 },
                    { label: 'Horário', value: time, edit: 2 },
                    { label: 'Contato', value: `${contact.name}, ${contact.email}, ${contact.phone}`, edit: 3 },
                    { label: 'Canal preferido', value: contact.channel, edit: 3 },
                    ...(contact.notes.trim() ? [{ label: 'Observações', value: contact.notes, edit: 3 }] : []),
                  ].map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}</dt>
                      <dd>{r.value}</dd>
                      <dd>
                        <button type="button" className="text-link" onClick={() => goTo(r.edit)} aria-label={`Alterar ${r.label.toLowerCase()}`}>
                          Alterar
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {step === 5 && property && (
                <div className={styles.confirm} role="status">
                  <span className={styles.confirmIcon} aria-hidden="true">
                    <Check size={28} />
                  </span>
                  <p className={styles.confirmText}>
                    Pedido de visita à <strong>{property.title}</strong> em {formatLongDate(date)}, às {time}, preparado neste protótipo.
                  </p>
                  <p className="demo-note">
                    <Info size={16} aria-hidden="true" />
                    <span>
                      Como este site é demonstrativo, a visita não foi agendada e nenhum dado foi enviado ou guardado. Em um site em operação, a equipe confirmaria o horário por {contact.channel.toLowerCase()}.
                    </span>
                  </p>
                  <div className={styles.confirmActions}>
                    <SiteLink to={`/imoveis/${property.slug}`} className="btn btn--primary">
                      Voltar ao imóvel
                    </SiteLink>
                    <button type="button" className="btn btn--ghost" onClick={restart}>
                      Agendar outra visita
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {stepError && (
            <p className={styles.error} role="alert">
              <CircleAlert size={16} aria-hidden="true" />
              {stepError}
            </p>
          )}

          {step < 5 && (
            <div className={styles.nav}>
              {step > 0 ? (
                <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  Voltar
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="btn btn--primary" onClick={next}>
                {step === 4 ? 'Confirmar solicitação' : 'Continuar'}
              </button>
            </div>
          )}
        </section>

        <aside className={styles.summary} aria-label="Resumo da visita">
          {property ? (
            <>
              <Img src={property.photos[0].id} alt="" sizes="(min-width: 1024px) 320px, 100vw" maxWidth={1080} className={styles.summaryImg} />
              <p className={styles.summaryTitle}>{property.title}</p>
              <p className="meta tabular">
                {region?.name}, {formatPrice(property.price, property.purpose)}
              </p>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Data</dt>
                  <dd>{date ? formatLongDate(date) : 'A escolher'}</dd>
                </div>
                <div>
                  <dt>Horário</dt>
                  <dd>{time || 'A escolher'}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="meta">O resumo da visita aparece aqui conforme você escolhe.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
