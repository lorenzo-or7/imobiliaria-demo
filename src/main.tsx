import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { routes } from './routes'
import { SavedProvider } from './state/saved'
import { ThemeProvider } from './state/theme'
import { ToastProvider } from './state/toast'

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>
          <SavedProvider>
            <RouterProvider router={router} />
          </SavedProvider>
        </ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>,
)
