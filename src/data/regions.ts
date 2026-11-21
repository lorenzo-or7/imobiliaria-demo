import { PHOTO } from './photos'
import type { Region } from './types'

/**
 * Perfis descritivos e qualitativos. Não contêm estatísticas de mercado.
 * Contagens e faixas de preço exibidas na interface são calculadas a partir
 * do catálogo demonstrativo.
 */
export const REGIONS: Region[] = [
  {
    id: 'alto-de-pinheiros',
    name: 'Alto de Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    profile:
      'Ruas arborizadas, lotes generosos e silêncio a poucos minutos da Marginal. Um bairro residencial que favorece casas térreas e jardins de fundo.',
    traits: ['Residencial', 'Arborizado', 'Praças de bairro'],
    lat: -23.5506,
    lng: -46.7122,
    mapX: 176,
    mapY: 150,
    cover: PHOTO.jacarandaDay,
  },
  {
    id: 'vila-madalena',
    name: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    profile:
      'Ladeiras, ateliês, cafés e vida de rua até tarde. Para quem gosta de resolver o dia a pé e quer arquitetura com personalidade.',
    traits: ['Vida de rua', 'Cultura', 'Ladeiras'],
    lat: -23.5536,
    lng: -46.6897,
    mapX: 252,
    mapY: 128,
    cover: PHOTO.ripadoDay,
  },
  {
    id: 'jardim-europa',
    name: 'Jardim Europa',
    city: 'São Paulo',
    state: 'SP',
    profile:
      'Traçado de bairro-jardim, ruas curvas e casas recuadas. Discreto, próximo aos principais eixos de serviços da zona oeste.',
    traits: ['Bairro-jardim', 'Discreto', 'Casas amplas'],
    lat: -23.5784,
    lng: -46.6831,
    mapX: 226,
    mapY: 214,
    cover: PHOTO.brise,
  },
  {
    id: 'itaim-bibi',
    name: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    profile:
      'Edifícios contemporâneos, restaurantes e escritórios na mesma quadra. Pensado para quem quer encurtar deslocamentos.',
    traits: ['Verticalizado', 'Serviços', 'Gastronomia'],
    lat: -23.5856,
    lng: -46.6766,
    mapX: 292,
    mapY: 238,
    cover: PHOTO.vertice,
  },
  {
    id: 'granja-viana',
    name: 'Granja Viana',
    city: 'Cotia',
    state: 'SP',
    profile:
      'Condomínios horizontais e mata nativa a oeste da capital. Mais espaço externo, ritmo mais calmo e acesso pela Raposo Tavares.',
    traits: ['Condomínios', 'Mata nativa', 'Casas com quintal'],
    lat: -23.5933,
    lng: -46.8331,
    mapX: 70,
    mapY: 262,
    cover: PHOTO.laminaFront,
  },
  {
    id: 'riviera',
    name: 'Riviera de São Lourenço',
    city: 'Bertioga',
    state: 'SP',
    profile:
      'Bairro planejado no litoral norte, com orla extensa e ciclovias. Funciona bem como casa de fim de semana ou endereço fixo.',
    traits: ['Litoral', 'Planejado', 'Ciclovias'],
    lat: -23.7915,
    lng: -46.0186,
    mapX: 372,
    mapY: 336,
    cover: PHOTO.albedo,
  },
  {
    id: 'ilhabela',
    name: 'Ilhabela',
    city: 'Ilhabela',
    state: 'SP',
    profile:
      'Ilha de mata atlântica e praias recortadas, acessível por balsa. Para quem procura recolhimento, mar e vela.',
    traits: ['Ilha', 'Mata atlântica', 'Esportes náuticos'],
    lat: -23.7781,
    lng: -45.3581,
    mapX: 528,
    mapY: 330,
    cover: PHOTO.falesia,
  },
  {
    id: 'campos-do-jordao',
    name: 'Campos do Jordão',
    city: 'Campos do Jordão',
    state: 'SP',
    profile:
      'Serra da Mantiqueira, araucárias e noites frias. Casas com lareira e terrenos em encosta, a cerca de três horas da capital.',
    traits: ['Serra', 'Clima frio', 'Araucárias'],
    lat: -22.7394,
    lng: -45.5914,
    mapX: 476,
    mapY: 72,
    cover: PHOTO.mantiqueira,
  },
]

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r]))

export function getRegion(id: string): Region {
  const region = REGION_BY_ID[id]
  if (!region) throw new Error(`Região desconhecida: ${id}`)
  return region
}

/** "Bairro, Cidade", sem repetir quando o bairro tem o nome da cidade (ex.: Ilhabela). */
export function regionPlace(region: Region | undefined): string {
  if (!region) return ''
  return region.city === region.name ? region.name : `${region.name}, ${region.city}`
}
