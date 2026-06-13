import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, deleteListing, updateListing } from '../api/listingService'
import { createApplication } from '../api/applicationService'
import { useAuth } from '../context/AuthContext'
import ListingForm from '../components/ListingForm'

const DPE_BG = { A:'#22c55e', B:'#84cc16', C:'#eab308', D:'#f97316', E:'#ef4444', F:'#dc2626', G:'#991b1b' }
const FEATURE_ICONS = { Piscine:'🏊', Jardin:'🌿', Garage:'🚗', Balcon:'🏗️', Cave:'🍷', Ascenseur:'🛗', Alarme:'🔒', Digicode:'🔐', 'Panneaux solaires':'☀️' }

const STATUS_COLOR = {
  'disponible':     { bg: 'rgba(13,27,42,0.82)', color: '#f5f2eb' },
  'sous compromis': { bg: 'rgba(224,123,57,0.9)', color: '#fff'    },
  'vendu':          { bg: 'rgba(192,57,43,0.9)',  color: '#fff'    },
  'loué':           { bg: 'rgba(139,94,131,0.9)', color: '#fff'    },
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, isAgent, isAdmin } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setActiveImg(0)
    getListing(id).then(setListing).catch(() => setError('Annonce introuvable.')).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Supprimer cette annonce ?')) return
    await deleteListing(id); navigate('/listings')
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try { const updated = await updateListing(id, form); setListing(updated); setEditing(false) }
    catch { alert('Erreur lors de la mise à jour.') }
    finally { setSaving(false) }
  }

  const handleApply = async () => {
    if (!currentUser) { navigate('/login'); return }
    setApplying(true)
    try {
      await createApplication({
        title: `Demande de visite — ${listing?.title ?? 'bien'}`,
        message: 'Je souhaite organiser une visite de ce bien.',
        user: { id: currentUser.id },
        listing: { id: Number(id) },
      })
      setApplied(true)
    }
    catch { alert('Erreur lors de la demande.') }
    finally { setApplying(false) }
  }

  if (loading) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #c9a96e', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#dc2626' }}>{error}</p>
      <Link to="/listings" className="btn-outline">← Retour aux annonces</Link>
    </div>
  )

  const canEdit = isAgent?.() || isAdmin?.()

  // Galerie : image principale d'abord, puis les autres photos (sans doublon)
  const gallery = (() => {
    const urls = []
    if (listing.mainPicture?.picture) urls.push(listing.mainPicture.picture)
    ;(listing.pictures ?? []).forEach(p => {
      if (p?.picture && !urls.includes(p.picture)) urls.push(p.picture)
    })
    if (urls.length === 0) urls.push(`https://picsum.photos/seed/ymmo-${listing.id}/1200/600`)
    return urls
  })()
  const img = gallery[Math.min(activeImg, gallery.length - 1)]
  const statusKey = (listing.status?.label ?? '').toLowerCase()
  const statusStyle = STATUS_COLOR[statusKey] ?? { bg: 'rgba(13,27,42,0.82)', color: '#f5f2eb' }

  if (editing) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <button onClick={() => setEditing(false)} style={{
          fontSize: '0.875rem', color: '#6b6355', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem',
        }}>
          ← Annuler
        </button>
        <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
          <h2 style={{ fontWeight: 600, color: '#0d1b2a', marginBottom: '1.25rem' }}>Modifier l'annonce</h2>
          <ListingForm initial={listing} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hero image — full width */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <img
          src={img}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.2) 60%, transparent 100%)' }} />

        {/* Badges on image */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {listing.status && (
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 500,
                background: statusStyle.bg, color: statusStyle.color,
              }}>
                {listing.status.label}
              </span>
            )}
            {listing.type && (
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 500,
                background: 'rgba(201,169,110,0.9)', color: '#0d1b2a',
              }}>
                {listing.type.label}
              </span>
            )}
          </div>
          {listing.energyRating && (
            <div style={{
              width: 40, height: 40, borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem', color: '#fff',
              background: DPE_BG[listing.energyRating] ?? '#64748b',
            }}>
              {listing.energyRating}
            </div>
          )}
        </div>

        {/* Compteur de photos */}
        {gallery.length > 1 && (
          <div style={{
            position: 'absolute', top: '1rem', right: '1rem',
            padding: '0.3rem 0.7rem', borderRadius: '999px',
            background: 'rgba(13,27,42,0.7)', color: '#f5f2eb',
            fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeImg + 1} / {gallery.length}
          </div>
        )}
      </div>

      {/* Bande de miniatures */}
      {gallery.length > 1 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.5rem 0' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {gallery.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`Photo ${i + 1}`}
                style={{
                  flexShrink: 0, width: 92, height: 64, borderRadius: '0.5rem', overflow: 'hidden',
                  cursor: 'pointer', padding: 0, background: 'none',
                  border: i === activeImg ? '2px solid #c9a96e' : '2px solid transparent',
                  opacity: i === activeImg ? 1 : 0.65, transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1 }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = i === activeImg ? 1 : 0.65 }}
              >
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

        {/* Breadcrumb */}
        <Link to="/listings" style={{
          fontSize: '0.85rem', color: '#6b6355', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem',
        }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux annonces
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── MAIN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Title & price */}
            <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#0d1b2a', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                {listing.title}
              </h1>
              <p className="font-display" style={{ fontSize: '2rem', fontWeight: 600, color: '#0d1b2a', marginBottom: '1.5rem' }}>
                {listing.price ? `${Number(listing.price).toLocaleString('fr-FR')} €` : '—'}
                {listing.type?.label === 'Location' && (
                  <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b6355', marginLeft: '0.375rem' }}>/mois</span>
                )}
              </p>

              {/* Spec grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {listing.address?.city && <SpecTile label="Ville" value={listing.address.city} icon="📍" />}
                {listing.roomCount > 0 && <SpecTile label="Pièces" value={`${listing.roomCount} p.`} icon="🏠" />}
                {listing.bedroomCount > 0 && <SpecTile label="Chambres" value={`${listing.bedroomCount} ch.`} icon="🛏" />}
                {listing.livingArea && <SpecTile label="Surface" value={`${listing.livingArea} m²`} icon="📐" />}
                {listing.landArea && <SpecTile label="Terrain" value={`${listing.landArea} m²`} icon="🌿" />}
                {listing.floorNumber != null && <SpecTile label="Étage" value={listing.floorNumber === 0 ? 'RDC' : `${listing.floorNumber}e`} icon="🏢" />}
              </div>

              {/* Address */}
              {listing.address && (
                <p style={{ fontSize: '0.875rem', color: '#6b6355', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <svg style={{ width: 14, height: 14, color: '#c9a96e', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {[listing.address.address, listing.address.city, listing.address.zipCode].filter(Boolean).join(' — ')}
                </p>
              )}

              {/* Description */}
              {listing.description && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(13,27,42,0.07)', margin: '1rem 0' }} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.75rem' }}>
                    Description
                  </p>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#3d3428' }}>{listing.description}</p>
                </>
              )}
            </div>

            {/* Features */}
            {listing.features?.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '1rem' }}>
                  Équipements & caractéristiques
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
                  {listing.features.map((f, i) => {
                    const name = f.featureName ?? f.label ?? f
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: '#f5f2eb', borderRadius: '0.5rem', padding: '0.625rem 0.875rem',
                        fontSize: '0.85rem', color: '#0d1b2a', fontWeight: 500,
                      }}>
                        <span>{FEATURE_ICONS[name] ?? '✓'}</span>
                        {name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Agent actions */}
            {canEdit && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setEditing(true)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  ✏️ Modifier
                </button>
                <button onClick={handleDelete} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626',
                  cursor: 'pointer',
                }}>
                  🗑 Supprimer
                </button>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* CTA card */}
            <div style={{
              background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}>
              <h3 style={{ fontWeight: 600, color: '#0d1b2a', marginBottom: '0.375rem' }}>Intéressé par ce bien ?</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b6355', marginBottom: '1.25rem' }}>Un conseiller YMMO vous recontacte sous 24h</p>

              {applied ? (
                <div style={{
                  background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)',
                  borderRadius: '0.625rem', padding: '1rem', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</p>
                  <p style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.9rem' }}>Demande envoyée !</p>
                  <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.375rem' }}>
                    Suivez l'avancement dans "Mes demandes"
                  </p>
                </div>
              ) : (
                <button onClick={handleApply} disabled={applying} className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '0.5rem' }}>
                  {applying ? 'Envoi…' : '📋 Demander une visite'}
                </button>
              )}

              {!currentUser && (
                <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem', color: '#6b6355' }}>
                  <Link to="/login" style={{ color: '#c9a96e', textDecoration: 'none', fontWeight: 500 }}>Connectez-vous</Link> pour faire une demande
                </p>
              )}
              {currentUser && !applied && (
                <Link to="/my-applications" style={{
                  display: 'block', textAlign: 'center', fontSize: '0.75rem',
                  color: '#6b6355', textDecoration: 'none', marginTop: '0.5rem',
                }}>
                  Voir mes demandes →
                </Link>
              )}
            </div>

            {/* Agency card */}
            {listing.agency && (
              <div style={{
                background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '1rem' }}>
                  Agence responsable
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '0.625rem', flexShrink: 0,
                    background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  }}>🏢</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0d1b2a', fontSize: '0.9rem' }}>{listing.agency.name}</p>
                    {listing.agency.phoneNumber && (
                      <a href={`tel:${listing.agency.phoneNumber}`} style={{ fontSize: '0.8rem', color: '#c9a96e', textDecoration: 'none' }}>
                        {listing.agency.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
                <Link to={`/agencies/${listing.agency.id}`} className="btn-outline" style={{ display: 'block', textAlign: 'center', width: '100%', justifyContent: 'center' }}>
                  Voir l'agence →
                </Link>
              </div>
            )}

            {listing.publicationDate && (
              <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#6b6355' }}>
                Publié le {new Date(listing.publicationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecTile({ label, value, icon }) {
  return (
    <div style={{
      background: '#f5f2eb', borderRadius: '0.5rem', padding: '0.75rem 1rem',
    }}>
      <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{icon}</div>
      <p style={{ fontSize: '0.7rem', color: '#6b6355', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: 600, color: '#0d1b2a', fontSize: '0.9rem' }}>{value}</p>
    </div>
  )
}
