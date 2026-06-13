import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getListings } from '../api/listingService'
import ListingCard from '../components/ListingCard'

const STATS = [
  { value: '2 547', label: 'Biens disponibles' },
  { value: '15',   label: 'Agences en France' },
  { value: '98 %', label: 'Clients satisfaits' },
]

const FEATURES = [
  {
    icon: <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
    title: 'Large catalogue',
    desc: 'Des centaines de biens résidentiels et professionnels dans toute la France et à Monaco.',
  },
  {
    icon: <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
    title: '15 agences',
    desc: 'Un réseau national avec des experts locaux pour vous accompagner dans chaque région.',
  },
  {
    icon: <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>,
    title: 'Accompagnement',
    desc: "Nos agents vous guident à chaque étape, de la recherche jusqu'à la signature.",
  },
  {
    icon: <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    title: 'Données marché',
    desc: "Analyses et prévisions pour prendre les meilleures décisions d'investissement.",
  },
]

export default function HomePage() {
  const { currentUser, isAgent, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')

  useEffect(() => {
    getListings().then(data => setFeatured(data.slice(0, 3))).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (budget) params.set('maxPrice', budget)
    navigate(`/listings${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div style={{ background: 'var(--navy)' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '640px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://source.unsplash.com/1800x1000/?real+estate+luxury+home"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,21,37,0.93) 0%, rgba(11,21,37,0.72) 55%, rgba(11,21,37,0.35) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,21,37,1) 0%, transparent 55%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '80rem', margin: '0 auto', padding: '6rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: '680px' }}>
            {/* Eyebrow */}
            <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ display: 'inline-block', width: '2rem', height: '1px', background: 'var(--gold)' }} />
              Groupe YMMO — Depuis 1998
            </p>

            {/* Headline */}
            <h1 className="font-display" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'white',
              marginBottom: '1.5rem',
            }}>
              Votre patrimoine<br />
              immobilier,{' '}
              <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>notre expertise</span>
            </h1>

            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '540px' }}>
              Plus de 2 500 biens sélectionnés en France et à Monaco. Des conseillers experts à votre service pour chaque étape de votre projet.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.375rem',
                maxWidth: '680px',
              }}
            >
              <select
                style={{ flex: 1, minWidth: '140px', background: 'white', color: '#1f2937', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                <option value="">Toutes les villes</option>
                <option value="Paris">Paris</option>
                <option value="Lyon">Lyon</option>
                <option value="Marseille">Marseille</option>
                <option value="Bordeaux">Bordeaux</option>
                <option value="Nice">Nice</option>
                <option value="Monaco">Monaco</option>
              </select>
              <select
                style={{ flex: 1, minWidth: '130px', background: 'white', color: '#1f2937', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="">Tous types</option>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
              <select
                style={{ flex: 1, minWidth: '130px', background: 'white', color: '#1f2937', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                value={budget}
                onChange={e => setBudget(e.target.value)}
              >
                <option value="">Tous budgets</option>
                <option value="100000">– 100 000 €</option>
                <option value="300000">– 300 000 €</option>
                <option value="500000">– 500 000 €</option>
                <option value="1000000">– 1 000 000 €</option>
              </select>
              <button
                type="submit"
                className="btn-gold"
                style={{ borderRadius: '0.5rem', padding: '0.75rem 1.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{
        background: 'var(--navy-light)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <p className="stat-number">{value}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED LISTINGS ── */}
      {featured.length > 0 && (
        <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '0.75rem' }}>Sélection du moment</p>
              <h2 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>
                Biens <span style={{ color: 'var(--gold)' }}>d'exception</span>
              </h2>
            </div>
            <Link
              to="/listings"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              Voir toutes les annonces
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section style={{
        background: 'var(--navy-light)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '5rem 0',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Header — centré */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Nos engagements</p>
            <h2 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>
              Pourquoi choisir <span style={{ color: 'var(--gold)' }}>YMMO ?</span>
            </h2>
            <p style={{ color: '#94a3b8', marginTop: '0.75rem', maxWidth: '36rem', margin: '0.75rem auto 0' }}>
              Un accompagnement personnalisé à chaque étape de votre projet immobilier.
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'var(--navy-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{
                  width: '3rem', height: '3rem',
                  borderRadius: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                  background: 'var(--gold-muted)',
                  color: 'var(--gold)',
                }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{
          borderRadius: '1rem',
          padding: '3rem 3.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0F1D30 0%, #142033 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: '-5rem', right: '-5rem',
            width: '16rem', height: '16rem', borderRadius: '50%',
            background: 'var(--gold)', opacity: 0.08, filter: 'blur(48px)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Prêt à franchir le cap ?</p>
            <h3 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              Votre projet commence ici
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: '28rem' }}>
              Parcourez notre catalogue ou contactez l'un de nos agents pour un accompagnement personnalisé.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <Link to="/listings" className="btn-gold">Voir les biens</Link>
            {!currentUser && <Link to="/login" className="btn-ghost">Se connecter</Link>}
            {(isAgent?.() || isAdmin?.()) && <Link to="/dashboard" className="btn-ghost">Dashboard →</Link>}
          </div>
        </div>
      </section>

    </div>
  )
}
