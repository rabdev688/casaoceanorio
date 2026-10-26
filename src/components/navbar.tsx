import { useState } from 'react'

const NAV_LINKS = [
  { href: '#story', label: 'About Us' },
  { href: '#contact', label: 'Contact us' },
  { href: '#gallery', label: 'Gallery' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMenu = () => setMobileMenuOpen(false)

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
                <a className="brand" href="#top" onClick={closeMenu}>
                  Casa Oceano Rio
                  <small className="location-tag">Tybee Island, Georgia</small>
                </a>
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
                  <a key={link.href} href={link.href} onClick={closeMenu}>
                    {link.label} <NavIcon type="arrow" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      <header className="nav">
        <a className="brand" href="#top">
          Casa Oceano Rio
          <small className="location-tag">Tybee Island, Georgia</small>
        </a>

        <nav>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a className="nav-cta" href="#contact">
            Book direct
          </a>
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
