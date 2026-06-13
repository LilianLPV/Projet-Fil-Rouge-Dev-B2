import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAgencies } from '../api/agencyService'
import { useAuth } from '../context/AuthContext'

const CITY_IMAGES = {
  'Aix-en-Provence': 'https://source.unsplash.com/600x400/?real+estate+provence',
  'Lyon':            'https://source.unsplash.com/600x400/?apartment+building+lyon',
  'Marseille':       'https://source.unsplash.com/600x400/?modern+home+marseille',
  'Toulouse':        'https://source.unsplash.com/600x400/?house+toulouse',
  'Nice':            'https://source.unsplash.com/600x400/?villa+nice',
  'Bordeaux':        'https://source.unsplash.com/600x400/?luxury+home+bordeaux',
  'Strasbourg':      'https://source.unsplash.com/600x400/?residential+strasbourg',
  'Nantes':          'https://source.unsplash.com/600x400/?apartment+nantes',
  'Paris':           'https://source.unsplash.com/600x400/?modern+apartment+paris',
  'Lille':           'https://source.unsplash.com/600x400/?house+lille',
  'Montpellier':     'https://source.unsplash.com/600x400/?home+montpellier',
  'Monaco':          'https://source.unsplash.com/600x400/?luxury+penthouse+monaco',
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth()

  useEffect(() => {
    getAgencies().then(setAgencies).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header — dark navy */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                Réseau national
              </p>
              <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>
                Nos agences
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.55)', marginTop: '0.25rem' }}>
                {agencies.length} agence{agencies.length !== 1 ? 's' : ''} à travers la France
              </p>
            </div>
            {isAdmin?.() && (
              <Link to="/agencies/new" className="btn-gold">+ Nouvelle agence</Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <div style={{ height: 192, background: '#e8e3d9' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 14, borderRadius: 4, background: '#e8e3d9', width: '60%', marginBottom: 10 }} />
                  <div style={{ height: 11, borderRadius: 4, background: '#e8e3d9', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {agencies.map(agency => {
              const city = agency.address?.city
              const img = CITY_IMAGES[city]
              return (
                <AgencyCard key={agency.id} agency={agency} city={city} img={img} />
              )
            })}
          </div>
        )}

        {!loading && agencies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b6355' }}>
            <p>Aucune agence trouvée.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AgencyCard({ agency, city, img }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/agencies/${agency.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: '#ffffff',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: hovered ? '0 20px 60px rgba(13,27,42,0.14)' : '0 2px 12px rgba(13,27,42,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 192, overflow: 'hidden', background: '#e8e3d9' }}>
        {img ? (
          <img
            src={img}
            alt={city}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: 64, height: 64, color: '#c9a96e', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.75) 0%, rgba(13,27,42,0.1) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
          <p className="font-display" style={{ color: '#f5f2eb', fontWeight: 600, fontSize: '1.05rem' }}>{agency.name}</p>
          {city && (
            <p style={{ fontSize: '0.75rem', color: '#c9a96e', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg style={{ width: 11, height: 11 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {city}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        {agency.description && (
          <p className="line-clamp-2" style={{ fontSize: '0.85rem', color: '#6b6355', marginBottom: '1rem' }}>
            {agency.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {agency.phoneNumber && (
            <span style={{ fontSize: '0.75rem', color: '#6b6355', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {agency.phoneNumber}
            </span>
          )}
          <span style={{
            marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 500,
            color: '#c9a96e', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            Voir les annonces
            <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
