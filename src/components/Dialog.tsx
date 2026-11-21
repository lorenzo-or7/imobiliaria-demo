import { useEffect, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  labelledBy?: string
  label?: string
}

/**
 * Diálogo modal nativo: o navegador cuida do bloqueio de foco, da tecla Esc
 * e da devolução do foco ao elemento de origem quando fecha.
 */
export function Dialog({ open, onClose, children, className, labelledBy, label }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      // Foco inicial explícito (o atributo autofocus do React não chega ao DOM).
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
      const target = returnFocus.current
      if (target && target.isConnected) target.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault()
        onCloseRef.current()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCloseRef.current()
      }}
    >
      {open ? children : null}
    </dialog>
  )
}
