import { EmptyState } from '../components/EmptyState'
import { SiteLink } from '../components/SiteLink'
import { useSeo } from '../hooks/useSeo'

export default function NotFound() {
  useSeo('Página não encontrada', 'O endereço acessado não existe neste site.')
  return (
    <div className="container page-top section" style={{ paddingTop: 'clamp(120px, 14vw, 176px)' }}>
      <EmptyState
        title="Esta página não existe ou mudou de endereço"
        actions={
          <>
            <SiteLink to="/imoveis" className="btn btn--primary">
              Explorar imóveis
            </SiteLink>
            <SiteLink to="/" className="btn btn--ghost">
              Voltar ao início
            </SiteLink>
          </>
        }
      >
        <p>Confira o link ou siga por um dos caminhos abaixo.</p>
      </EmptyState>
    </div>
  )
}
