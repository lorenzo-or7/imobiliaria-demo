import { PHOTO } from '../data/photos'
import { Img } from '../components/Img'
import { ImageReveal, Magnetic, TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import styles from './FinalCta.module.css'

export function FinalCta() {
  return (
    <section className={styles.band} aria-labelledby="final-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <TextReveal id="final-title" lines={['O espaço certo', 'muda tudo.']} className={`display-xl ${styles.title}`} />
          <p className={styles.text}>Conte o que você procura. A equipe responde com opções do catálogo e horários para visita.</p>
          <div className={styles.ctas}>
            <Magnetic>
              <SiteLink to="/imoveis" className={`btn ${styles.primary}`}>
                Encontrar meu imóvel
              </SiteLink>
            </Magnetic>
            <SiteLink to="/contato" className={`btn ${styles.ghost}`}>
              Conversar com especialista
            </SiteLink>
          </div>
        </div>
        <ImageReveal className={styles.media}>
          <Img src={PHOTO.horizonte} alt="Entrada de uma casa contemporânea iluminada ao entardecer, com escada de pedra e jardim" sizes="(min-width: 1024px) 40vw, 100vw" />
        </ImageReveal>
      </div>
    </section>
  )
}
