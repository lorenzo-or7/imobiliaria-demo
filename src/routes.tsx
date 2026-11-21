import type { RouteObject } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RouteError } from './pages/RouteError'
import Home from './pages/Home'

const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => {
  const mod = await loader()
  return { Component: mod.default }
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="page-top container" aria-busy="true" />,
    children: [
      { index: true, element: <Home /> },
      { path: 'imoveis', lazy: page(() => import('./pages/Catalog')) },
      { path: 'imoveis/:slug', lazy: page(() => import('./pages/PropertyPage')) },
      { path: 'colecoes', lazy: page(() => import('./pages/Collections')) },
      { path: 'colecoes/:slug', lazy: page(() => import('./pages/CollectionPage')) },
      { path: 'comparar', lazy: page(() => import('./pages/Compare')) },
      { path: 'favoritos', lazy: page(() => import('./pages/Favorites')) },
      { path: 'agendar', lazy: page(() => import('./pages/Schedule')) },
      { path: 'contato', lazy: page(() => import('./pages/Contact')) },
      { path: 'sobre', lazy: page(() => import('./pages/About')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
]
