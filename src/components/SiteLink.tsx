import { forwardRef } from 'react'
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'

/** Link interno com View Transitions habilitadas por padrão. */
export const SiteLink = forwardRef<HTMLAnchorElement, LinkProps>(function SiteLink(props, ref) {
  return <Link ref={ref} viewTransition {...props} />
})

export const SiteNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function SiteNavLink(props, ref) {
  return <NavLink ref={ref} viewTransition {...props} />
})
