import { Info } from 'lucide-react'
import { TYPE_LABEL, TYPE_ORDER } from '../../data/catalog'
import { SITE } from '../../data/site'
import { useToast } from '../../state/toast'
import { SiteLink } from '../SiteLink'
import { NAV_LINKS } from './Navbar'
import styles from './Footer.module.css'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { notify } = useToast()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <SiteLink to="/" className={styles.wordmark}>
            {SITE.wordmark}
          </SiteLink>
          <p className={styles.tagline}>{SITE.tagline}</p>
          <p className={styles.about}>Curadoria de casas e apartamentos escolhidos pela arquitetura, pela luz e pelo lugar onde estão.</p>
        </div>

        <nav aria-labelledby="ft-nav" className={styles.col}>
          <h2 id="ft-nav" className={styles.heading}>
            Navegação
          </h2>
          <ul>
            {[{ to: '/', label: 'Início' }, ...NAV_LINKS, { to: '/favoritos', label: 'Favoritos' }, { to: '/comparar', label: 'Comparar imóveis' }, { to: '/agendar', label: 'Agendar visita' }].map((l) => (
              <li key={l.to}>
                <SiteLink to={l.to}>{l.label}</SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="ft-cat" className={styles.col}>
          <h2 id="ft-cat" className={styles.heading}>
            Categorias
          </h2>
          <ul>
            {TYPE_ORDER.map((t) => (
              <li key={t}>
                <SiteLink to={`/imoveis?tipo=${t}`}>{TYPE_LABEL[t]}</SiteLink>
              </li>
            ))}
            <li>
              <SiteLink to="/imoveis?finalidade=aluguel">Imóveis para alugar</SiteLink>
            </li>
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.heading}>Contato</h2>
          <address className={styles.address}>
            <span>{SITE.addressLine}</span>
            <span>{SITE.email}</span>
            <span>{SITE.phoneDisplay}</span>
            <span className={styles.small}>{SITE.hours}</span>
          </address>
          <p className={styles.small}>Dados de contato fictícios.</p>
          <ul className={styles.socials} aria-label="Redes sociais (demonstrativas)">
            {SITE.socials.map((s) => (
              <li key={s}>
                <button type="button" className={styles.social} onClick={() => notify(`${s}: perfil demonstrativo, ainda não publicado.`)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.notice}>
          <Info size={16} aria-hidden="true" />
          <span>
            Protótipo demonstrativo. Imóveis, preços e contatos são fictícios, e nenhum dado enviado nos formulários sai deste navegador. {SITE.photoCredit}
          </span>
        </p>
        <p className={styles.sign}>
          © {YEAR} {SITE.name}. Desenvolvido por <span className={styles.or7}>{SITE.credit}</span>
        </p>
      </div>
    </footer>
  )
}
