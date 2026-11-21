import { PHOTO } from '../data/photos'
import { Img } from '../components/Img'
import { ImageReveal, Parallax, TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'
import styles from './About.module.css'

const CRITERIA = [
  { title: 'Projeto', text: 'Plantas que funcionam, materiais bem escolhidos e construção cuidadosa. Visitamos antes de aceitar qualquer imóvel.' },
  { title: 'Luz e ventilação', text: 'Orientação solar, aberturas e ventilação cruzada pesam tanto quanto a metragem.' },
  { title: 'Lugar', text: 'O entorno decide a rotina. Avaliamos deslocamentos, comércio, ruído e o que há a pé.' },
  { title: 'Documentação', text: 'Matrícula, habite-se e débitos conferidos antes da primeira visita, para evitar surpresas na negociação.' },
]

export default function About() {
  useSeo('Sobre', 'Como a Atelier seleciona imóveis: projeto, luz, lugar e documentação em ordem.')
  return (
    <div className={styles.page}>
      <section className={`container page-top ${styles.intro}`}>
        <TextReveal as="h1" lines={['Menos imóveis.', 'Mais critério.']} className="display-xl" trigger="mount" />
        <p className={styles.statement}>
          A Atelier é uma imobiliária de curadoria. Em vez de listar tudo o que está à venda, escolhemos poucos imóveis e conhecemos cada um a fundo, para indicar o certo a quem procura.
        </p>
      </section>

      <div className={`container ${styles.imageRow}`}>
        <ImageReveal className={styles.imgA}>
          <Img src={PHOTO.ripadoNight} alt="Casa com escada em ripado de madeira iluminada à noite" sizes="(min-width: 1024px) 60vw, 100vw" />
        </ImageReveal>
        <Parallax className={styles.imgB} strength={0.06}>
          <Img src={PHOTO.kitchenWood} alt="Cozinha branca com ilha e banquetas de madeira" sizes="(min-width: 1024px) 30vw, 60vw" />
        </Parallax>
      </div>

      <section className={`container section ${styles.criteria}`} aria-labelledby="criterios">
        <h2 id="criterios" className="display-l">
          O que olhamos antes de aceitar um imóvel
        </h2>
        <ol className={styles.list}>
          {CRITERIA.map((c, i) => (
            <li key={c.title}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.title}>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.closing}`}>
        <p className={styles.note}>
          Atelier Imóveis é uma marca fictícia criada para este protótipo. Não há registro profissional, equipe ou endereço reais associados a ela.
        </p>
        <div className={styles.ctas}>
          <SiteLink to="/imoveis" className="btn btn--primary">
            Explorar imóveis
          </SiteLink>
          <SiteLink to="/contato" className="btn btn--ghost">
            Falar com a equipe
          </SiteLink>
        </div>
      </section>
    </div>
  )
}
