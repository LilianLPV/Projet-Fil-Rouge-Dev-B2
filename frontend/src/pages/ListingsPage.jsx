import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getListings } from '../api/listingService'
import { getListingTypes } from '../api/referenceService'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/ListingCard'

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const { isAgent, isAdmin } = useAuth()
  const [listings, setListings] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [typeId, setTypeId] = useState('')
  const [sort, setSort] = useState('recent')

  const fetchListings = () => {
    setLoading(true); setError(null)
    const params = {}
    if (city.trim()) params.city = city.trim()
    if (maxPrice) params.maxPrice = maxPrice
    getListings(params)
      .then(setListings)
      .catch(() => setError('Impossible de charger les annonces.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchListings() }, [])
  useEffect(() => { getListingTypes().then(setTypes).catch(() => {}) }, [])

  const handleSearch = (e) => { e.preventDefault(); fetchListings() }

  const filtered = listings
    .filter(l => !typeId || l.type?.id === Number(typeId))
    .sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price) - Number(b.price)
      if (sort === 'price-desc') return Number(b.price) - Number(a.price)
      return b.id - a.id
    })

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid rgba(13,27,42,0.12)',
    borderRadius: '0.5rem',
    color: '#0d1b2a',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                Catalogue immobilier
              </p>
              <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>
                Biens disponibles
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.55)', marginTop: '0.25rem' }}>
                {loading ? '…' : `${filtered.length} bien${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {(isAgent?.() || isAdmin?.()) && (
              <Link to="/listings/new" className="btn-gold">
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle annonce
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Filtres */}
        <form
          onSubmit={handleSearch}
          style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
            display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
              Ville
            </label>
            <input
              style={inputStyle}
              placeholder="Paris, Lyon…"
              value={city}
              onChange={e => setCity(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
              Prix max (€)
            </label>
            <input
              style={inputStyle}
              placeholder="Ex : 500 000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
            />
          </div>

          <div style={{ flex: '1 1 130px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
              Type
            </label>
            <select
              value={typeId}
              onChange={e => setTypeId(e.target.value)}
              style={{ ...inputStyle }}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
            >
              <option value="">Tous les types</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 130px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
              Trier par
            </label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ ...inputStyle }}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
            >
              <option value="recent">Plus récent</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap' }}>
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Filtrer
            </button>
            <button
              type="button"
              onClick={() => { setCity(''); setMaxPrice(''); setTypeId(''); setSort('recent') }}
              style={{
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem',
                background: 'transparent', border: '1px solid rgba(13,27,42,0.15)',
                color: '#6b6355', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '0.75rem', overflow: 'hidden', opacity: 0.7 }}>
                <div style={{ height: 220, background: '#e8e3d9', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 12, borderRadius: 4, background: '#e8e3d9', width: '40%', marginBottom: 10 }} />
                  <div style={{ height: 16, borderRadius: 4, background: '#e8e3d9', width: '80%', marginBottom: 8 }} />
                  <div style={{ height: 12, borderRadius: 4, background: '#e8e3d9', width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
            <button onClick={fetchListings} className="btn-gold">Réessayer</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '1rem',
              background: '#ffffff', boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg style={{ width: 32, height: 32, color: '#c9a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p style={{ color: '#0d1b2a', fontWeight: 600, marginBottom: '0.5rem' }}>Aucun bien trouvé</p>
            <p style={{ color: '#6b6355', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Aucune annonce ne correspond à vos critères.</p>
            <button onClick={() => { setCity(''); setMaxPrice(''); setTypeId(''); fetchListings() }} className="btn-outline">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}
