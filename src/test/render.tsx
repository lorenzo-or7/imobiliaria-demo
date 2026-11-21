import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../routes'
import { SavedProvider } from '../state/saved'
import { ThemeProvider } from '../state/theme'
import { ToastProvider } from '../state/toast'

/** Renderiza o site completo em uma rota, com os mesmos provedores da aplicação. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const utils = render(
    <ThemeProvider>
      <ToastProvider>
        <SavedProvider>
          <RouterProvider router={router} />
        </SavedProvider>
      </ToastProvider>
    </ThemeProvider>,
  )
  return { ...utils, router }
}
