import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { photoUrl } from '../data/photos'
import type { Photo } from '../data/types'
import { Dialog } from './Dialog'
import { Img } from './Img'
import styles from './Lightbox.module.css'

interface Props {
  photos: Photo[]
  index: number | null
  onIndex: (i: number | null) => void
  title: string
}

export function scopeLabel(p: Photo): string {
  return p.scope === 'imovel' ? 'Foto do imóvel' : 'Referência de ambientação'
}

export function Lightbox({ photos, index, onIndex, title }: Props) {
  const open = index !== null
  const i = index ?? 0
  const reduce = useReducedMotion()
  const [dir, setDir] = useState(1)
  const [zoom, setZoom] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (delta: number) => {
      setDir(delta)
      setZoom(false)
      setPan({ x: 0, y: 0 })
      onIndex((i + delta + photos.length) % photos.length)
    },
    [i, onIndex, photos.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Home') onIndex(0)
      else if (e.key === 'End') onIndex(photos.length - 1)
      else if (e.key === '+' || e.key === '=') setZoom(true)
      else if (e.key === '-') {
        setZoom(false)
        setPan({ x: 0, y: 0 })
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go, onIndex, photos.length])

  // Pré-carrega as vizinhas para transições sem espera.
  useEffect(() => {
    if (!open) return
    ;[1, -1].forEach((d) => {
      const p = photos[(i + d + photos.length) % photos.length]
      const img = new Image()
      img.src = photoUrl(p.id, 1920)
    })
  }, [open, i, photos])

  const toggleZoom = () => {
    setZoom((z) => !z)
    setPan({ x: 0, y: 0 })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) d.moved = true
    if (zoom && stageRef.current) {
      const r = stageRef.current.getBoundingClientRect()
      const maxX = r.width / 2
      const maxY = r.height / 2
      setPan({ x: Math.max(-maxX, Math.min(maxX, d.px + dx)), y: Math.max(-maxY, Math.min(maxY, d.py + dy)) })
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    if (!zoom && d.moved && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  const photo = photos[i]

  return (
    <Dialog open={open} onClose={() => onIndex(null)} className={styles.dialog} label={`Galeria de ${title}`}>
      {photo && (
        <div className={styles.shell}>
          <div className={styles.top}>
            <p className={styles.counter} aria-live="polite">
              <span className="tabular">
                {i + 1} / {photos.length}
              </span>
              <span className={`${styles.scope} ${photo.scope === 'referencia' ? styles.ref : ''}`}>{scopeLabel(photo)}</span>
            </p>
            <div className={styles.topActions}>
              <button type="button" className={styles.iconBtn} onClick={toggleZoom} aria-pressed={zoom} aria-label={zoom ? 'Reduzir zoom' : 'Ampliar foto'}>
                {zoom ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => onIndex(null)} aria-label="Fechar galeria" data-autofocus>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            className={`${styles.stage} ${zoom ? styles.zoomed : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drag.current = null)}
            onDoubleClick={toggleZoom}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={photo.id + i}
                className={styles.slide}
                custom={dir}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.zoomLayer} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom ? 2 : 1})` }}>
                  <Img src={photo.id} alt={photo.alt} sizes="100vw" priority className={styles.img} draggable={false} />
                </div>
              </motion.div>
            </AnimatePresence>
            <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Foto anterior">
              <ChevronLeft size={26} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Próxima foto">
              <ChevronRight size={26} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.bottom}>
            <p className={styles.caption}>{photo.caption}</p>
            <ul className={styles.thumbs} aria-label="Miniaturas">
              {photos.map((p, n) => (
                <li key={p.id + n}>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-current={n === i}
                    aria-label={`Foto ${n + 1}: ${p.caption}`}
                    onClick={() => {
                      setDir(n > i ? 1 : -1)
                      setZoom(false)
                      setPan({ x: 0, y: 0 })
                      onIndex(n)
                    }}
                  >
                    <Img src={p.id} alt="" sizes="80px" maxWidth={480} />
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>Use as setas do teclado, deslize ou toque duas vezes para ampliar.</p>
          </div>
        </div>
      )}
    </Dialog>
  )
}
