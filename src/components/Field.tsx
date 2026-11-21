import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: (aria: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
  optional?: boolean
}

/** Rótulo persistente, dica e erro associados ao controle via aria-describedby. */
export function Field({ id, label, error, hint, children, optional }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span style={{ color: 'var(--text-2)', fontWeight: 400 }}> (opcional)</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <CircleAlert size={14} aria-hidden="true" style={{ marginTop: 2, flex: 'none' }} />
          {error}
        </p>
      )}
    </div>
  )
}
