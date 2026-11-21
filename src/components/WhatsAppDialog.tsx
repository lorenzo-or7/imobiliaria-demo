import { useState } from 'react'
import { Copy, Info, MessageCircle, X } from 'lucide-react'
import { SITE } from '../data/site'
import { useToast } from '../state/toast'
import { Dialog } from './Dialog'
import styles from './WhatsAppDialog.module.css'

export function whatsappHref(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* segue para o fallback */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export { copyText }

/**
 * Sem número autorizado (SITE.whatsappNumber = null), o fluxo é demonstrativo:
 * mostra a mensagem pré-preenchida e permite copiá-la, sem abrir contato externo.
 */
export function WhatsAppButton({ message, label = 'Conversar pelo WhatsApp', className }: { message: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(message)
  const { notify } = useToast()
  const number = SITE.whatsappNumber

  return (
    <>
      <button
        type="button"
        className={className ?? 'btn btn--ghost'}
        onClick={() => {
          setText(message)
          setOpen(true)
        }}
      >
        <MessageCircle size={18} aria-hidden="true" />
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} className={styles.dialog} labelledBy="wa-title">
        <div className={styles.inner}>
          <div className={styles.top}>
            <h2 id="wa-title" className={styles.title}>
              Mensagem pelo WhatsApp
            </h2>
            <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => setOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <label className="field__label" htmlFor="wa-text">
            Sua mensagem
          </label>
          <textarea id="wa-text" className="textarea" value={text} onChange={(e) => setText(e.target.value.slice(0, 600))} rows={5} />
          {number ? (
            <a className="btn btn--primary" href={whatsappHref(number, text)} target="_blank" rel="noopener noreferrer">
              Abrir no WhatsApp
            </a>
          ) : (
            <>
              <p className="demo-note">
                <Info size={16} aria-hidden="true" />
                <span>Protótipo: nenhum número de WhatsApp foi configurado, então nada é aberto ou enviado. Você pode copiar a mensagem para usar depois.</span>
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={async () => {
                  const ok = await copyText(text)
                  notify(ok ? 'Mensagem copiada.' : 'Não foi possível copiar. Selecione o texto e copie manualmente.', { tone: ok ? 'success' : 'error' })
                }}
              >
                <Copy size={16} aria-hidden="true" />
                Copiar mensagem
              </button>
            </>
          )}
        </div>
      </Dialog>
    </>
  )
}
