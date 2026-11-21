import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { SITE } from '../data/site'
import { ContactForm } from '../components/ContactForm'
import { TextReveal } from '../components/motion'
import { SiteLink } from '../components/SiteLink'
import { WhatsAppButton } from '../components/WhatsAppDialog'
import { useSeo } from '../hooks/useSeo'
import shared from './shared.module.css'
import styles from './Contact.module.css'

export default function Contact() {
  useSeo('Contato', 'Fale com a equipe para comprar, alugar ou anunciar um imóvel. Formulário demonstrativo.')
  return (
    <div className={`container page-top ${shared.page}`}>
      <header className={shared.header}>
        <TextReveal as="h1" lines={['Vamos', 'conversar']} className="display-xl" trigger="mount" />
        <div>
          <p className="lead">Conte o que você procura ou qual imóvel quer anunciar. Respondemos em horário comercial.</p>
        </div>
      </header>

      <div className={styles.layout}>
        <ContactForm withSubject />

        <aside className={styles.aside} aria-label="Outras formas de contato">
          <ul className={styles.info}>
            <li>
              <Mail size={18} aria-hidden="true" />
              <span>{SITE.email}</span>
            </li>
            <li>
              <Phone size={18} aria-hidden="true" />
              <span>{SITE.phoneDisplay}</span>
            </li>
            <li>
              <MapPin size={18} aria-hidden="true" />
              <span>{SITE.addressLine}</span>
            </li>
            <li>
              <Clock size={18} aria-hidden="true" />
              <span>{SITE.hours}</span>
            </li>
          </ul>
          <p className="meta">Contatos fictícios, apenas para demonstração.</p>
          <WhatsAppButton message="Olá! Gostaria de falar com um especialista da Atelier sobre imóveis disponíveis." />
          <div className={styles.visit}>
            <p className={styles.visitTitle}>Já escolheu um imóvel?</p>
            <SiteLink to="/agendar" className="text-link">
              Agende a visita direto
            </SiteLink>
          </div>
        </aside>
      </div>
    </div>
  )
}
