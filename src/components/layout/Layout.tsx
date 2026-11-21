import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { CompareTray, NavProgress, Toaster } from './Overlays'

export function Layout() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <NavProgress />
      <Navbar />
      <main id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
        <Outlet />
      </main>
      <Footer />
      <CompareTray />
      <Toaster />
      <ScrollRestoration />
    </>
  )
}
