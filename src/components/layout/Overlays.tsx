import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { useLocation, useNavigation } from 'react-router-dom'
import { PROPERTY_BY_ID } from '../../data/properties'
import { COMPARE_LIMIT, useSaved } from '../../state/saved'
import { useToast } from '../../state/toast'
import { Img } from '../Img'
import { SiteLink } from '../SiteLink'
import styles from './Overlays.module.css'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const reduce = useReducedMotion()
  return (
    <div className={styles.toasts} role="status" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduce}
            className={`${styles.toast} ${styles[t.tone]}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {t.tone === 'success' && <CheckCircle2 size={18} aria-hidden="true" className={styles.icon} />}
            {t.tone === 'error' && <CircleAlert size={18} aria-hidden="true" className={styles.icon} />}
            <p>{t.message}</p>
            {t.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className={styles.close} aria-label="Fechar aviso" onClick={() => dismiss(t.id)}>
              <X size={16} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Bandeja fixa com os imóveis escolhidos para comparação. */
export function CompareTray() {
  const { compare, removeCompare } = useSaved()
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const hidden = pathname.startsWith('/comparar') || pathname.startsWith('/agendar')
  const items = compare.map((id) => PROPERTY_BY_ID[id]).filter(Boolean)
  const show = items.length > 0 && !hidden
  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className={`${styles.tray} ${pathname.startsWith('/imoveis/') ? styles.raised : ''}`}
          aria-label="Imóveis para comparar"
          initial={reduce ? { opacity: 0 } : { y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ul className={styles.trayList}>
            {Array.from({ length: COMPARE_LIMIT }, (_, i) => {
              const p = items[i]
              return (
                <li key={p?.id ?? `slot-${i}`} className={styles.slot}>
                  {p ? (
                    <>
                      <Img src={p.photos[0].id} alt="" sizes="56px" maxWidth={480} className={styles.thumb} />
                      <span className={styles.slotName}>{p.title}</span>
                      <button type="button" className={styles.remove} aria-label={`Tirar ${p.title} da comparação`} onClick={() => removeCompare(p.id)}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <span className={styles.empty} aria-hidden="true">
                      +
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <div className={styles.trayCta}>
            <span className={styles.trayCount}>
              {items.length} de {COMPARE_LIMIT}
            </span>
            {items.length >= 2 ? (
              <SiteLink to="/comparar" className="btn btn--primary btn--small">
                Comparar
              </SiteLink>
            ) : (
              <span className={styles.trayHint}>Escolha mais um</span>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export function NavProgress() {
  const navigation = useNavigation()
  return navigation.state === 'loading' ? <div className="nav-progress" role="progressbar" aria-label="Carregando página" /> : null
}
