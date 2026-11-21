import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

/** Moldura de janela vazia: o desenho reforça "ainda não há nada aqui" sem ilustração genérica. */
export function EmptyState({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={styles.empty} role="status">
      <svg className={styles.art} viewBox="0 0 120 120" aria-hidden="true">
        <rect x="18" y="14" width="84" height="92" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <line x1="60" y1="14" x2="60" y2="106" stroke="currentColor" strokeWidth="1.2" />
        <line x1="18" y1="60" x2="102" y2="60" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24 100 L54 66" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <path d="M66 54 L96 20" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.body}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
