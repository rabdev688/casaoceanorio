import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/amenities', label: 'Amenities' },
  { to: '/location', label: 'Location' },
  { to: '/book', label: 'Contact Us' },
] as const

function NavIcon({ type }: { type: 'menu' | 'close' | 'arrow' }) {
  const paths = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  )
}

export function Navbar() {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeMenu = () => setMobileMenuOpen(false)
  const solid = pathname !== '/' || scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <>
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
            <div>
              <div className="mobile-nav-top">
                <Link className="brand" to="/" onClick={closeMenu}>
                  Casa Oceano Rio
                  <small className="location-tag">Tybee Island, Georgia</small>
                </Link>
                <button
                  className="mobile-nav-close"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  type="button"
                >
                  <NavIcon type="close" />
                </button>
              </div>

              <nav className="mobile-nav-links">
                {NAV_LINKS.map((link) => (
                  <Link key={link.to} to={link.to} onClick={closeMenu}>
                    {link.label} <NavIcon type="arrow" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      <header className={solid ? 'nav solid' : 'nav'}>
        <Link className="brand" to="/">
          Casa Oceano Rio
          <small className="location-tag">Tybee Island, Georgia</small>
        </Link>

        <nav>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="nav-cta" to="/book">
            Book direct
          </Link>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            type="button"
          >
            <NavIcon type="menu" />
          </button>
        </div>
      </header>
    </>
  )
}
