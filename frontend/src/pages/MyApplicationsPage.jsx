import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApplicationsByUser } from '../api/applicationService'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function MyApplicationsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    getApplicationsByUser(currentUser.id)
      .then(setApplications)
      .catch(() => setError('Impossible de charger vos demandes.'))
      .finally(() => setLoading(false))
  }, [currentUser])

  if (!currentUser) return null

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
            Mon espace
          </p>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>
            Mes demandes
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.55)', marginTop: '0.25rem' }}>
            Suivez l'avancement de vos démarches immobilières
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(13,27,42,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: '#e8e3d9' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 4, background: '#e8e3d9', width: '60%', marginBottom: 8 }} />
                    <div style={{ height: 11, borderRadius: 4, background: '#e8e3d9', width: '30%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && applications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '1rem',
              background: '#ffffff', boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg style={{ width: 32, height: 32, color: '#c9a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p style={{ color: '#0d1b2a', fontWeight: 600, marginBottom: '0.5rem' }}>Aucune demande en cours</p>
            <p style={{ color: '#6b6355', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Parcourez nos annonces et faites une demande de visite.
            </p>
            <Link to="/listings" className="btn-gold">Voir les biens disponibles</Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(app => (
              <div
                key={app.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '0.75rem', flexShrink: 0,
                      background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    }}>🏠</div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0d1b2a', fontSize: '0.9rem' }}>
                        {app.listing?.title ?? `Annonce #${app.listing?.id ?? '—'}`}
                      </h3>
                      {app.listing?.price && (
                        <p className="font-display" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#c9a96e', marginTop: '0.2rem' }}>
                          {Number(app.listing.price).toLocaleString('fr-FR')} €
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <StatusBadge label={app.status?.label ?? app.status ?? 'En attente'} />
                    <p style={{ fontSize: '0.7rem', color: '#6b6355', marginTop: '0.375rem' }}>Demande #{app.id}</p>
                  </div>
                </div>

                {app.listing && (
                  <div style={{
                    marginTop: '1rem', paddingTop: '1rem',
                    borderTop: '1px solid rgba(13,27,42,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <Link
                      to={`/listings/${app.listing.id}`}
                      style={{ fontSize: '0.85rem', fontWeight: 500, color: '#c9a96e', textDecoration: 'none' }}
                    >
                      Voir l'annonce →
                    </Link>
                    {app.listing.agency && (
                      <p style={{ fontSize: '0.75rem', color: '#6b6355' }}>{app.listing.agency.name}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
