import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

/** Fallback de erro inesperado (ex.: falha ao carregar um trecho do site após atualização). */
export function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className="container" style={{ paddingBlock: '160px 96px', display: 'grid', gap: 20, justifyItems: 'start' }}>
      <h1 className="display-m">{notFound ? 'Página não encontrada' : 'Não foi possível abrir esta página'}</h1>
      <p className="lead">
        {notFound ? 'O endereço acessado não existe.' : 'Pode ter sido uma falha de conexão. Recarregue a página para tentar de novo.'}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Recarregar
        </button>
        <Link to="/" className="btn btn--ghost">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
