import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { regionPlace } from '../data/regions'
import type { Region } from '../data/types'
import styles from './MapEmbed.module.css'

/**
 * Mapa da região via OpenStreetMap (licença ODbL), carregado só após o clique:
 * nenhum serviço externo recebe a visita sem ação do usuário.
 * Mostra a área aproximada do bairro, nunca um endereço.
 */
export function MapEmbed({ region }: { region: Region }) {
  const [loaded, setLoaded] = useState(false)
  const d = 0.018
  const bbox = [region.lng - d * 1.6, region.lat - d, region.lng + d * 1.6, region.lat + d].map((n) => n.toFixed(4)).join(',')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        {loaded ? (
          <iframe title={`Mapa da região de ${region.name}`} src={src} loading="lazy" referrerPolicy="no-referrer" className={styles.iframe} />
        ) : (
          <div className={styles.placeholder}>
            <svg viewBox="0 0 400 240" className={styles.lines} aria-hidden="true" preserveAspectRatio="none">
              <path d="M0 60 C80 80 140 40 220 70 S360 120 400 90" />
              <path d="M0 150 C100 130 160 180 260 150 S360 130 400 170" />
              <path d="M120 0 C130 80 100 160 140 240" />
              <path d="M290 0 C270 90 310 150 280 240" />
            </svg>
            <MapPin size={28} aria-hidden="true" className={styles.pin} />
            <p className={styles.text}>
              {regionPlace(region)}
            </p>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setLoaded(true)}>
              Carregar mapa da região
            </button>
            <p className={styles.small}>O mapa vem do OpenStreetMap e só carrega se você pedir.</p>
          </div>
        )}
      </div>
      <p className={styles.note}>
        Área aproximada do bairro. O endereço exato é informado no agendamento da visita.
        {loaded && (
          <>
            {' '}
            Mapa ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              colaboradores do OpenStreetMap
            </a>
            .
          </>
        )}
      </p>
    </div>
  )
}
