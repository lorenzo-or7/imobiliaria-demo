import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { Heart, Menu, Moon, Sun, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SITE } from '../../data/site'
import { useSaved } from '../../state/saved'
import { useTheme } from '../../state/theme'
import { Dialog } from '../Dialog'
import { Magnetic } from '../motion'
import { SiteLink, SiteNavLink } from '../SiteLink'
import styles from './Navbar.module.css'

export const NAV_LINKS = [
  { to: '/imoveis', label: 'Explorar imóveis' },
  { to: '/colecoes', label: 'Coleções' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button type="button" className={`icon-btn ${className ?? ''}`} onClick={toggle} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'} title={dark ? 'Tema claro' : 'Tema escuro'}>
      <motion.span key={theme} initial={{ rotate: -40, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.35 }} style={{ display: 'inline-grid' }}>
        {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </motion.span>
    </button>
  )
}

function FavoritesLink({ className }: { className?: string }) {
  const { favorites } = useSaved()
  const n = favorites.length
  return (
    <SiteLink to="/favoritos" className={`icon-btn ${styles.favLink} ${className ?? ''}`} aria-label={n ? `Favoritos, ${n} ${n === 1 ? 'imóvel salvo' : 'imóveis salvos'}` : 'Favoritos'}>
      <Heart size={18} aria-hidden="true" fill={n ? 'currentColor' : 'none'} />
      {n > 0 && (
        <motion.span key={n} className={styles.count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} aria-hidden="true">
          {n}
        </motion.span>
      )}
    </SiteLink>
  )
}

export function Navbar() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [compact, setCompact] = useState(false)
  const location = useLocation()
  // O menu fica aberto apenas na rota em que foi aberto: navegar o fecha sem efeito extra.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const menuOpen = openAt === location.pathname
  const setMenuOpen = (open: boolean) => setOpenAt(open ? location.pathname : null)

  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 48))

  return (
    <>
      <motion.header
        className={`${styles.bar} ${compact ? styles.compact : ''}`}
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <div className={styles.inner}>
          <SiteLink to="/" className={styles.wordmark} aria-label={`${SITE.name}, página inicial`}>
            {SITE.wordmark}
          </SiteLink>

          <nav aria-label="Principal" className={styles.nav}>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <SiteNavLink to={l.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                    {l.label}
                  </SiteNavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.tools}>
            <FavoritesLink />
            <ThemeToggle className={styles.hideMobile} />
            <Magnetic className={styles.hideMobile}>
              <SiteLink to="/agendar" className={`btn btn--primary btn--small ${styles.cta}`}>
                Agendar visita
              </SiteLink>
            </Magnetic>
            <button type="button" className={`icon-btn ${styles.menuBtn}`} aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}>
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} className={styles.sheet} label="Menu">
        <div id="mobile-menu" className={styles.sheetInner}>
          <div className={styles.sheetTop}>
            <SiteLink to="/" className={styles.wordmark}>
              {SITE.wordmark}
            </SiteLink>
            <button type="button" className="icon-btn" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} data-autofocus>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Menu móvel">
            <ul className={styles.sheetLinks}>
              {[{ to: '/', label: 'Início' }, ...NAV_LINKS, { to: '/favoritos', label: 'Favoritos' }, { to: '/comparar', label: 'Comparar' }].map((l, i) => (
                <motion.li key={l.to} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <SiteNavLink to={l.to} end={l.to === '/'} className={({ isActive }) => `${styles.sheetLink} ${isActive ? styles.active : ''}`}>
                    {l.label}
                  </SiteNavLink>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className={styles.sheetFoot}>
            <SiteLink to="/agendar" className="btn btn--primary">
              Agendar visita
            </SiteLink>
            <div className={styles.sheetTheme}>
              <span>Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
