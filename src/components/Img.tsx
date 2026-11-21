import { useState, type CSSProperties } from 'react'
import { ImageOff } from 'lucide-react'
import { photoSrcSet, photoUrl } from '../data/photos'

interface ImgProps {
  /** identificador da fotografia no Unsplash (ver data/photos.ts) */
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  maxWidth?: number
  style?: CSSProperties
  /** largura e altura intrínsecas para reservar espaço (evita CLS) */
  ratio?: [number, number]
  draggable?: boolean
}

export function Img({ src: id, alt, sizes, className, priority, maxWidth = 2400, style, ratio = [3, 2], draggable }: ImgProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className={className} role="img" aria-label={`${alt} (imagem indisponível)`} style={{ ...style, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
        <ImageOff size={24} aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      className={className}
      src={photoUrl(id, 1440)}
      srcSet={photoSrcSet(id, maxWidth)}
      sizes={sizes}
      alt={alt}
      width={ratio[0] * 400}
      height={ratio[1] * 400}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      style={style}
      draggable={draggable}
    />
  )
}
