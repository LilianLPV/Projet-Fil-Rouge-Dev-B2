import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createListing } from '../api/listingService'
import ListingForm from '../components/ListingForm'

export default function NewListingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (form) => {
    setLoading(true)
    try {
      const created = await createListing(form)
      navigate(`/listings/${created.id}`)
    } catch {
      alert('Erreur lors de la création.')
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
            Catalogue
          </p>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>
            Nouvelle annonce
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link to="/listings" style={{
          fontSize: '0.875rem', color: '#6b6355', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem',
        }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux annonces
        </Link>

        <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
          <ListingForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  )
}
