import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_CONFIG = {
  admin:  { label: 'Administrateur', bg: 'rgba(239,68,68,0.15)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)'  },
  agent:  { label: 'Agent',          bg: 'rgba(59,130,246,0.15)', color: '#2563eb', border: 'rgba(59,130,246,0.25)' },
  client: { label: 'Client',         bg: 'rgba(22,163,74,0.15)',  color: '#16a34a', border: 'rgba(22,163,74,0.25)'  },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, isAdmin, isAgent, getRoleName } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const role = getRoleName()
  const roleCfg = ROLE_CONFIG[role] ?? { label: 'Visiteur', bg: 'rgba(201,169,110,0.12)', color: '#c9a96e', border: 'rgba(201,169,110,0.25)' }

  const isActive = (to) => to !== '/' ? pathname.startsWith(to) : pathname === '/'

  const NavLink = ({ to, children }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
        style={{
          padding: '0.5rem 0.875rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'all 0.15s',
          background: active ? 'rgba(201,169,110,0.12)' : 'transparent',
          color: active ? '#c9a96e' : 'rgba(245,242,235,0.65)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#f5f2eb'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(245,242,235,0.65)'; e.currentTarget.style.background = 'transparent' } }}
      >
        {children}
      </Link>
    )
  }

  return (
    <header
      role="banner"
      aria-label="Navigation principale YMMO"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#0d1b2a',
        borderBottom: '1px solid rgba(201,169,110,0.12)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Skip link accessibilité */}
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>

        {/* Logo */}
        <Link
          to="/"
          aria-label="YMMO — Retour à l'accueil"
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: 34, height: 34,
            borderRadius: '0.375rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#c9a96e',
          }}>
            <svg style={{ width: 17, height: 17, color: '#0d1b2a' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 21V9l10-7 10 7v12H14v-6h-4v6H2z"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontWeight: 600, color: '#f5f2eb', fontSize: '0.9rem', letterSpacing: '0.25em' }}>YMMO</span>
        </Link>

        {/* Nav desktop */}
        <nav aria-label="Menu principal" style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
          <NavLink to="/listings">Biens disponibles</NavLink>
          <NavLink to="/agencies">Agences</NavLink>
          {currentUser && <NavLink to="/my-applications">Mes demandes</NavLink>}
          {(isAgent() || isAdmin()) && <NavLink to="/applications">Demandes clients</NavLink>}
          {(isAgent() || isAdmin()) && <NavLink to="/dashboard">Dashboard</NavLink>}
          {isAdmin() && <NavLink to="/analytics">Analyse Python</NavLink>}
          {isAdmin() && <NavLink to="/users">Utilisateurs</NavLink>}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} role="region" aria-label="Compte utilisateur">
          {currentUser ? (
            <>
              {/* Avatar + name + role badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }} aria-label={`Connecté en tant que ${currentUser.username} — ${roleCfg.label}`}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#c9a96e', color: '#0d1b2a', fontWeight: 700, fontSize: '0.75rem',
                  }}
                >
                  {currentUser.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.25 }}>
                  <p style={{ fontWeight: 600, color: '#f5f2eb', fontSize: '0.8rem' }}>{currentUser.username}</p>
                  <span
                    role="status"
                    aria-label={`Rôle : ${roleCfg.label}`}
                    style={{
                      fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 600,
                      background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}`,
                    }}
                  >
                    {roleCfg.label}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); navigate('/login') }}
                aria-label="Se déconnecter de YMMO"
                style={{
                  fontSize: '0.8rem', color: 'rgba(245,242,235,0.5)',
                  cursor: 'pointer', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                  transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,242,235,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                aria-label="Se connecter à YMMO"
                style={{
                  color: 'rgba(245,242,235,0.65)', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#f5f2eb'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,242,235,0.65)'}
              >
                Se connecter
              </Link>
              <Link
                to="/login"
                className="btn-gold"
                aria-label="Accéder à l'espace client"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                Espace client
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
