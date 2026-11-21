import { useRef, type ElementType, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

interface TextRevealProps {
  lines: string[]
  as?: ElementType
  className?: string
  delay?: number
  /** "mount" anima imediatamente; "view" anima ao entrar na tela */
  trigger?: 'mount' | 'view'
  id?: string
}

/**
 * Text Mask Reveal: cada linha sobe de dentro de uma máscara.
 * O texto completo fica disponível para leitores de tela via aria-label.
 */
export function TextReveal({ lines, as: Tag = 'h2', className, delay = 0, trigger = 'view', id }: TextRevealProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  // A detecção fica no título (não na linha deslocada, que está recortada pela máscara).
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const shown = trigger === 'mount' || inView
  const label = lines.join(' ')
  return (
    <Tag ref={ref} className={className} aria-label={label} id={id}>
      {lines.map((line, i) => (
        <span className="tr-line" aria-hidden="true" key={`${line}-${i}`}>
          {reduce ? (
            <span className="tr-inner">{line}</span>
          ) : (
            <motion.span
              className="tr-inner"
              initial={{ y: '108%' }}
              animate={{ y: shown ? '0%' : '108%' }}
              transition={{ duration: 1, ease: EASE_OUT, delay: delay + i * 0.09 }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  )
}

interface ImageRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  trigger?: 'mount' | 'view'
  from?: 'bottom' | 'left'
}

/** Image Reveal: um painel recua (transform) enquanto a foto assenta da escala 1.12 para 1. */
export function ImageReveal({ children, className, delay = 0, trigger = 'view', from = 'bottom' }: ImageRevealProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={`ir ${className ?? ''}`}>{children}</div>
  const play = trigger === 'mount' ? { animate: 'shown' } : { whileInView: 'shown', viewport: { once: true, amount: 0.2 } }
  return (
    <motion.div className={`ir ${className ?? ''}`} initial="hidden" {...play}>
      <motion.div
        className="ir__media"
        variants={{ hidden: { scale: 1.14 }, shown: { scale: 1 } }}
        transition={{ duration: 1.6, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
      <motion.span
        className="ir__cover"
        aria-hidden="true"
        style={{ transformOrigin: from === 'bottom' ? 'top' : 'right' }}
        variants={from === 'bottom' ? { hidden: { scaleY: 1 }, shown: { scaleY: 0 } } : { hidden: { scaleX: 1 }, shown: { scaleX: 0 } }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay }}
      />
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** deslocamento relativo, 0.06 = 6% para cada lado */
  strength?: number
}

/** Architectural Parallax: deslocamento discreto preso ao progresso de rolagem do próprio bloco. */
export function Parallax({ children, className, strength = 0.06 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength * 100}%`, `${strength * 100}%`])
  return (
    <div ref={ref} className={`px ${className ?? ''}`}>
      <motion.div className="px__inner" style={reduce ? undefined : { y, scale: 1 + strength * 2.2 }}>
        {children}
      </motion.div>
    </div>
  )
}

/** Magnetic: só em ponteiro fino, deslocamento máximo de 6px para não comprometer o clique. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    x.set(Math.max(-1, Math.min(1, dx)) * 6)
    y.set(Math.max(-1, Math.min(1, dy)) * 4)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span className={`magnetic ${className ?? ''}`} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}
