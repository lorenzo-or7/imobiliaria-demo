import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Info, Loader2 } from 'lucide-react'
import type { Property } from '../data/types'
import { formatPhone, hasErrors, sanitizeText, validateContact, type ContactFields, type FieldErrors } from '../lib/validation'
import { Field } from './Field'
import styles from './ContactForm.module.css'

export const SUBJECTS = ['Quero comprar', 'Quero alugar', 'Quero anunciar meu imóvel', 'Outro assunto'] as const

interface Props {
  property?: Property
  withSubject?: boolean
  submitLabel?: string
  compact?: boolean
}

type Values = ContactFields & { message: string; subject: string }

export function interestMessage(p: Property): string {
  return `Olá! Tenho interesse no imóvel ${p.title} (código ${p.id}). Gostaria de receber mais informações e saber os horários disponíveis para visita.`
}

export function ContactForm({ property, withSubject, submitLabel = 'Enviar mensagem', compact }: Props) {
  const uid = useId()
  const reduce = useReducedMotion()
  const initial: Values = {
    name: '',
    email: '',
    phone: '',
    consent: false,
    subject: withSubject ? '' : 'Interesse em imóvel',
    message: property ? interestMessage(property) : '',
  }
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<FieldErrors<Values>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const [focusError, setFocusError] = useState(0)

  // Depois que os erros são renderizados, leva o foco ao primeiro campo inválido.
  useEffect(() => {
    if (!focusError) return
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [focusError])

  const validate = (v: Values): FieldErrors<Values> => {
    const e: FieldErrors<Values> = { ...validateContact(v) }
    if (withSubject && !v.subject) e.subject = 'Escolha um assunto.'
    if (!v.message.trim()) e.message = 'Escreva uma mensagem curta.'
    return e
  }

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched[key]) setErrors(validate(next))
  }

  const blur = (key: keyof Values) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched({ name: true, email: true, phone: true, consent: true, subject: true, message: true })
    if (hasErrors(errs)) {
      setFocusError((n) => n + 1)
      return
    }
    setStatus('sending')
    // Protótipo: nenhum dado sai do navegador. O atraso simula a confirmação de envio.
    window.setTimeout(() => setStatus('done'), 700)
  }

  const reset = () => {
    setValues(initial)
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  const errorCount = Object.values(errors).filter(Boolean).length
  const showSummary = errorCount > 1 && touched.consent

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <motion.div
            key="done"
            className={styles.done}
            role="status"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={28} aria-hidden="true" className={styles.doneIcon} />
            <h3 className={styles.doneTitle}>Mensagem registrada neste protótipo</h3>
            <p>
              Obrigado, {values.name.trim().split(' ')[0]}. Como este é um site demonstrativo, a mensagem não foi enviada a ninguém e seus dados não foram guardados.
            </p>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Escrever outra mensagem
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" ref={formRef} className={styles.form} noValidate onSubmit={onSubmit} exit={{ opacity: 0 }} aria-describedby={`${uid}-demo`}>
            {showSummary && (
              <p className={styles.summary} role="alert">
                Revise {errorCount} campos destacados antes de enviar.
              </p>
            )}
            <div className={styles.row}>
              <Field id={`${uid}-name`} label="Nome" error={touched.name ? errors.name : undefined}>
                {(a) => (
                  <input {...a} className="input" autoComplete="name" value={values.name} onChange={(e) => update('name', sanitizeText(e.target.value, 80))} onBlur={() => blur('name')} />
                )}
              </Field>
              <Field id={`${uid}-email`} label="E-mail" error={touched.email ? errors.email : undefined}>
                {(a) => (
                  <input
                    {...a}
                    className="input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => update('email', sanitizeText(e.target.value, 120))}
                    onBlur={() => blur('email')}
                  />
                )}
              </Field>
            </div>
            <div className={styles.row}>
              <Field id={`${uid}-phone`} label="Telefone" hint="Com DDD." error={touched.phone ? errors.phone : undefined}>
                {(a) => (
                  <input
                    {...a}
                    className="input tabular"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(11) 90000-0000"
                    value={values.phone}
                    onChange={(e) => update('phone', formatPhone(e.target.value))}
                    onBlur={() => blur('phone')}
                  />
                )}
              </Field>
              {withSubject && (
                <Field id={`${uid}-subject`} label="Assunto" error={touched.subject ? errors.subject : undefined}>
                  {(a) => (
                    <select {...a} className="select" value={values.subject} onChange={(e) => update('subject', e.target.value)} onBlur={() => blur('subject')}>
                      <option value="">Escolha um assunto</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              )}
            </div>
            <Field id={`${uid}-msg`} label="Mensagem" error={touched.message ? errors.message : undefined}>
              {(a) => (
                <textarea {...a} className="textarea" rows={compact ? 4 : 5} value={values.message} onChange={(e) => update('message', sanitizeText(e.target.value, 600))} onBlur={() => blur('message')} />
              )}
            </Field>

            <div className="field">
              <label className="check">
                <input
                  type="checkbox"
                  checked={values.consent}
                  aria-invalid={Boolean(touched.consent && errors.consent)}
                  aria-describedby={touched.consent && errors.consent ? `${uid}-consent-error` : undefined}
                  onChange={(e) => {
                    setTouched((t) => ({ ...t, consent: true }))
                    update('consent', e.target.checked)
                  }}
                />
                <span>Li o aviso: meus dados servem apenas para responder a este contato e não são compartilhados.</span>
              </label>
              {touched.consent && errors.consent && (
                <p className="field__error" id={`${uid}-consent-error`}>
                  {errors.consent}
                </p>
              )}
            </div>

            <p className="demo-note" id={`${uid}-demo`}>
              <Info size={16} aria-hidden="true" />
              <span>Formulário demonstrativo. Nada é enviado ou armazenado.</span>
            </p>

            <button type="submit" className="btn btn--primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <Loader2 size={18} aria-hidden="true" className={styles.spin} />
                  Enviando
                </>
              ) : (
                submitLabel
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
