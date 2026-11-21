import { useEffect } from 'react'

const BASE = 'Atelier Imóveis'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Atualiza título, descrição e Open Graph por rota. */
export function useSeo(title: string, description: string, image?: string) {
  useEffect(() => {
    const full = title ? `${title} | ${BASE}` : `${BASE} | Espaços que transformam perspectivas`
    document.title = full
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href)
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', image)
  }, [title, description, image])
}
