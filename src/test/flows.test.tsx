import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PROPERTIES, PROPERTY_BY_SLUG } from '../data/properties'
import { COMPARE_KEY, FAVORITES_KEY } from '../state/saved'
import { renderRoute } from './render'

const alugueis = PROPERTIES.filter((p) => p.purpose === 'aluguel').length

describe('Catálogo', () => {
  it('lê filtros da URL, combina filtros e atualiza contagem e URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/imoveis?finalidade=aluguel')
    const count = await screen.findByText((_, el) => el?.id === 'results-count')
    expect(count).toHaveTextContent(`${alugueis} imóveis encontrados`)

    const aside = screen.getByRole('complementary', { name: 'Filtros' })
    await user.click(within(aside).getByRole('button', { name: 'Loft' }))
    await waitFor(() => expect(count).toHaveTextContent('1 imóvel encontrado'))
    expect(router.state.location.search).toContain('tipo=loft')
    expect(router.state.location.search).toContain('finalidade=aluguel')

    // Chip ativo remove o filtro.
    await user.click(screen.getByRole('button', { name: 'Remover filtro Loft' }))
    await waitFor(() => expect(count).toHaveTextContent(`${alugueis} imóveis encontrados`))
  })

  it('mostra estado vazio com saída para limpar filtros', async () => {
    const user = userEvent.setup()
    renderRoute('/imoveis?finalidade=aluguel&tipo=cobertura')
    expect(await screen.findByText('Nenhum imóvel com essa combinação')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(screen.getByText((_, el) => el?.id === 'results-count')).toHaveTextContent(`${PROPERTIES.length} imóveis encontrados`))
  })

  it('busca textual filtra o catálogo', async () => {
    const user = userEvent.setup()
    renderRoute('/imoveis')
    const input = await screen.findByRole('searchbox')
    await user.type(input, 'ilhabela')
    await waitFor(() => expect(screen.getByText((_, el) => el?.id === 'results-count')).toHaveTextContent('1 imóvel encontrado'))
    expect(screen.getByRole('heading', { name: 'Casa Falésia' })).toBeInTheDocument()
  })
})

describe('Favoritos', () => {
  it('salva no localStorage e aparece na página de favoritos', async () => {
    const user = userEvent.setup()
    const first = renderRoute('/imoveis?q=falesia')
    await user.click(await screen.findByRole('button', { name: 'Salvar Casa Falésia nos favoritos' }))
    expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')).toEqual([PROPERTY_BY_SLUG['casa-falesia'].id])
    first.unmount()

    renderRoute('/favoritos')
    expect(await screen.findByRole('heading', { name: 'Casa Falésia' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remover Casa Falésia dos favoritos' }))
    expect(await screen.findByText('Nenhum imóvel salvo ainda')).toBeInTheDocument()
  })
})

describe('Comparador', () => {
  it('compara imóveis salvos, destaca extremos e permite remover', async () => {
    const user = userEvent.setup()
    const a = PROPERTY_BY_SLUG['casa-brise']
    const b = PROPERTY_BY_SLUG['residencia-lamina']
    localStorage.setItem(COMPARE_KEY, JSON.stringify([a.id, b.id]))
    renderRoute('/comparar')
    const table = await screen.findByRole('table')
    expect(within(table).getByRole('columnheader', { name: /Casa Brise/ })).toBeInTheDocument()
    expect(within(table).getAllByText('Maior área').length).toBeGreaterThan(0)
    expect(within(table).getByText('Menor preço')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remover Casa Brise da comparação' }))
    expect(await screen.findByText('Falta pelo menos mais um imóvel')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(COMPARE_KEY) ?? '[]')).toEqual([b.id])
  })

  it('limita a seleção a três imóveis', async () => {
    const user = userEvent.setup()
    const ids = PROPERTIES.slice(0, 3).map((p) => p.id)
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids))
    renderRoute(`/imoveis?q=${encodeURIComponent('falesia')}`)
    await user.click(await screen.findByRole('button', { name: 'Comparar Casa Falésia' }))
    expect(await screen.findByText(/aceita até 3 imóveis/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(COMPARE_KEY) ?? '[]')).toEqual(ids)
  })
})

describe('Agendamento', () => {
  it('percorre as seis etapas com validação e confirmação local', async () => {
    const user = userEvent.setup()
    renderRoute('/agendar?imovel=casa-jacaranda')

    // Etapa 2 (imóvel já escolhido pela URL): data.
    expect(await screen.findByRole('heading', { name: 'Escolha o dia' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma data')
    const day = screen.getAllByRole('radio').find((r) => !(r as HTMLInputElement).disabled)!
    await user.click(day)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    // Etapa 3: horário.
    expect(await screen.findByRole('heading', { name: 'Escolha o horário' })).toBeInTheDocument()
    const slot = screen.getAllByRole('radio').find((r) => !(r as HTMLInputElement).disabled)!
    await user.click(slot)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    // Etapa 4: contato, com validação.
    expect(await screen.findByRole('heading', { name: 'Como falamos com você?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nome'), 'Marina Costa')
    await user.type(screen.getByLabelText('E-mail'), 'marina@exemplo.com.br')
    await user.type(screen.getByLabelText('Telefone'), '11912345678')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    // Etapa 5: revisão.
    expect(await screen.findByRole('heading', { name: 'Confira antes de enviar' })).toBeInTheDocument()
    expect(screen.getByText(/Casa Jacarandá, Alto de Pinheiros/)).toBeInTheDocument()
    expect(screen.getByText('(11) 91234-5678', { exact: false })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar solicitação' }))

    // Etapa 6: confirmação honesta.
    expect(await screen.findByRole('heading', { name: 'Solicitação registrada' })).toBeInTheDocument()
    expect(screen.getByText(/a visita não foi agendada/)).toBeInTheDocument()
  })
})

describe('Contato', () => {
  it('valida campos e mostra retorno sem enviar dados', async () => {
    const user = userEvent.setup()
    renderRoute('/contato')
    const submit = await screen.findByRole('button', { name: 'Enviar mensagem' })
    await user.click(submit)
    expect(await screen.findByText('Escolha um assunto.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()

    await user.type(screen.getByLabelText('Nome'), 'Rafael Lima')
    await user.type(screen.getByLabelText('E-mail'), 'rafael@exemplo.com')
    await user.type(screen.getByLabelText('Telefone'), '2134567890')
    await user.selectOptions(screen.getByLabelText('Assunto'), 'Quero alugar')
    await user.type(screen.getByLabelText('Mensagem'), 'Procuro um loft perto do metrô.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByText('Mensagem registrada neste protótipo', {}, { timeout: 2000 })).toBeInTheDocument()
  })
})

describe('Rotas', () => {
  it('mostra página 404 para endereço inexistente e para imóvel inexistente', async () => {
    renderRoute('/nao-existe')
    expect(await screen.findByText('Esta página não existe ou mudou de endereço')).toBeInTheDocument()
  })

  it('mostra aviso quando o imóvel não existe', async () => {
    renderRoute('/imoveis/imovel-inexistente')
    expect(await screen.findByText('Este imóvel não está mais no catálogo')).toBeInTheDocument()
  })

  it('página do imóvel exibe preço, galeria e formulário de interesse pré-preenchido', async () => {
    renderRoute('/imoveis/casa-jacaranda')
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa Jacarandá' })).toBeInTheDocument()
    expect(screen.getAllByText('R$ 8.900.000').length).toBeGreaterThan(0)
    expect((screen.getByLabelText('Mensagem') as HTMLTextAreaElement).value).toContain('AT-101')
    expect(screen.getAllByText('Referência').length).toBeGreaterThan(0)
  })
})
