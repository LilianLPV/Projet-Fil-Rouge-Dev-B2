import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAgency, deleteAgency, updateAgency } from '../api/agencyService'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/ListingCard'

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

export default function AgencyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [agency, setAgency] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAgency(id)
      .then(ag => {
        setAgency(ag)
        setForm({ name: ag.name, description: ag.description ?? '', phone: ag.phoneNumber ?? '' })
      })
      .catch(() => setError('Agence introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!agency) return
    fetch(`/api/listings/agency/${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setListings)
      .catch(() => {})
  }, [agency])

  const handleDelete = async () => {
    if (!confirm('Supprimer cette agence ?')) return
    await deleteAgency(id); navigate('/agencies')
  }

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const updated = await updateAgency(id, form); setAgency(updated); setEditing(false) }
    catch { alert('Erreur lors de la mise à jour.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #c9a96e', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#dc2626' }}>{error}</p>
      <Link to="/agencies" className="btn-outline">← Retour</Link>
    </div>
  )

  const fieldStyle = { marginBottom: '1rem' }
  const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        <Link to="/agencies" style={{
          fontSize: '0.875rem', color: '#6b6355', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem',
        }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux agences
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Agency info card */}
          <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '0.75rem',
              background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', marginBottom: '1.25rem',
            }}>🏢</div>

            {editing ? (
              <form onSubmit={handleUpdate}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nom</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c9a96e'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Téléphone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c9a96e'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#c9a96e'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={saving} className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? '…' : 'Sauvegarder'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0d1b2a', marginBottom: '0.75rem' }}>
                  {agency.name}
                </h1>
                {agency.phoneNumber && (
                  <p style={{ fontSize: '0.85rem', color: '#6b6355', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg style={{ width: 13, height: 13, color: '#c9a96e', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {agency.phoneNumber}
                  </p>
                )}
                {agency.address && (
                  <p style={{ fontSize: '0.85rem', color: '#6b6355', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <svg style={{ width: 13, height: 13, color: '#c9a96e', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {[agency.address.address, agency.address.city, agency.address.zipCode].filter(Boolean).join(', ')}
                  </p>
                )}
                {agency.description && (
                  <p style={{ fontSize: '0.85rem', color: '#6b6355', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {agency.description}
                  </p>
                )}

                <a href="mailto:contact@ymmo.fr" className="btn-gold" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  Contacter l'agence
                </a>

                {isAdmin?.() && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditing(true)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                      Modifier
                    </button>
                    <button onClick={handleDelete} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 500,
                      background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', cursor: 'pointer',
                    }}>
                      Supprimer
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Listings section */}
          <div>
            <h2 style={{ fontWeight: 600, color: '#0d1b2a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', display: 'inline-block' }} />
              Annonces de cette agence
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#6b6355' }}>({listings.length})</span>
            </h2>
            {listings.length === 0 ? (
              <div style={{
                background: '#ffffff', borderRadius: '0.75rem', padding: '3rem',
                textAlign: 'center', boxShadow: '0 2px 8px rgba(13,27,42,0.06)',
              }}>
                <p style={{ color: '#6b6355' }}>Aucune annonce pour cette agence.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
