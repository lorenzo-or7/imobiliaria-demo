import { motion, useReducedMotion } from 'motion/react'
import { Check, Heart, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Property } from '../data/types'
import { COMPARE_LIMIT, useSaved } from '../state/saved'
import { useToast } from '../state/toast'
import styles from './SavedButtons.module.css'

interface Props {
  property: Property
  variant?: 'overlay' | 'inline'
  className?: string
}

export function FavoriteButton({ property, variant = 'overlay', className }: Props) {
  const { isFavorite, toggleFavorite, storageAvailable } = useSaved()
  const { notify } = useToast()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const active = isFavorite(property.id)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleFavorite(property.id)
    notify(added ? `${property.title} foi salvo nos favoritos.` : `${property.title} saiu dos favoritos.`, {
      tone: added ? 'success' : 'neutral',
      action: added
        ? { label: 'Ver favoritos', onClick: () => navigate('/favoritos', { viewTransition: true }) }
        : { label: 'Desfazer', onClick: () => toggleFavorite(property.id) },
    })
    if (!storageAvailable) notify('Este navegador bloqueou o armazenamento local. Os favoritos valem só nesta visita.', { tone: 'error' })
  }

  return (
    <button
      type="button"
      className={`${styles.fav} ${styles[variant]} ${className ?? ''}`}
      aria-pressed={active}
      aria-label={active ? `Remover ${property.title} dos favoritos` : `Salvar ${property.title} nos favoritos`}
      onClick={onClick}
    >
      <motion.span
        key={active ? 'on' : 'off'}
        className={styles.heart}
        initial={reduce ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      >
        <Heart size={18} strokeWidth={1.6} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.span>
      {variant === 'inline' && <span>{active ? 'Salvo' : 'Salvar'}</span>}
    </button>
  )
}

export function CompareButton({ property, variant = 'inline', className }: Props) {
  const { isCompared, toggleCompare, compare } = useSaved()
  const { notify } = useToast()
  const navigate = useNavigate()
  const active = isCompared(property.id)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = toggleCompare(property.id)
    if (result === 'full') {
      notify(`A comparação aceita até ${COMPARE_LIMIT} imóveis. Remova um para incluir ${property.title}.`, {
        tone: 'error',
        action: { label: 'Abrir comparação', onClick: () => navigate('/comparar', { viewTransition: true }) },
      })
      return
    }
    if (result === 'added') {
      const total = compare.length + 1
      notify(
        total < 2 ? `${property.title} entrou na comparação. Escolha mais um imóvel.` : `${property.title} entrou na comparação (${total} de ${COMPARE_LIMIT}).`,
        total >= 2 ? { tone: 'success', action: { label: 'Comparar agora', onClick: () => navigate('/comparar', { viewTransition: true }) } } : { tone: 'success' },
      )
    } else {
      notify(`${property.title} saiu da comparação.`)
    }
  }

  return (
    <button
      type="button"
      className={`${styles.cmp} ${styles[variant]} ${className ?? ''}`}
      aria-pressed={active}
      aria-label={active ? `Tirar ${property.title} da comparação` : `Comparar ${property.title}`}
      onClick={onClick}
    >
      {active ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      <span>{active ? 'Comparando' : 'Comparar'}</span>
    </button>
  )
}
