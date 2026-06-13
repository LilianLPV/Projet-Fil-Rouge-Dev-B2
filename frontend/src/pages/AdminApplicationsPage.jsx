import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApplications, updateApplication } from '../api/applicationService'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const STATUSES = [
  { id: 1, label: 'En attente' },
  { id: 2, label: 'Acceptée' },
  { id: 3, label: 'Refusée' },
  { id: 4, label: 'Annulée' },
]

export default function AdminApplicationsPage() {
  const { currentUser, isAdmin, isAgent } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [filter, setFilter] = useState('Toutes')

  const allowed = isAdmin?.() || isAgent?.()

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    if (!allowed) { navigate('/'); return }

    getApplications()
      .then(data => {
        let apps = Array.isArray(data) ? data : []
        // Un agent ne voit que les demandes concernant les biens de son agence
        if (isAgent?.() && !isAdmin?.() && currentUser.agency?.id) {
          apps = apps.filter(a => a.listing?.agency?.id === currentUser.agency.id)
        }
        // Tri par date décroissante
        apps.sort((a, b) => (b.submissionDate ?? '').localeCompare(a.submissionDate ?? ''))
        setApplications(apps)
      })
      .catch(() => setError('Impossible de charger les demandes.'))
      .finally(() => setLoading(false))
  }, [currentUser])

  const handleStatusChange = async (app, statusId) => {
    setSavingId(app.id)
    try {
      const updated = await updateApplication(app.id, {
        title: app.title,
        message: app.message,
        submissionDate: app.submissionDate,
        user: { id: app.user?.id },
        listing: { id: app.listing?.id },
        status: { id: Number(statusId) },
      })
      setApplications(prev => prev.map(a => (a.id === app.id ? { ...a, status: updated.status } : a)))
    } catch {
      alert('Erreur lors de la mise à jour du statut.')
    } finally {
      setSavingId(null)
    }
  }

  if (!currentUser || !allowed) return null

  const filtered = filter === 'Toutes'
    ? applications
    : applications.filter(a => (a.status?.label ?? '') === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.label] = applications.filter(a => (a.status?.label ?? '') === s.label).length
    return acc
  }, {})

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
            Espace {isAdmin?.() ? 'administrateur' : 'agent'}
          </p>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>
            Demandes des clients
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.55)', marginTop: '0.25rem' }}>
            {applications.length} demande{applications.length !== 1 ? 's' : ''} de visite{isAgent?.() && !isAdmin?.() ? ' pour votre agence' : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Filtres */}
        {!loading && !error && applications.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['Toutes', ...STATUSES.map(s => s.label)].map(f => {
              const active = filter === f
              const count = f === 'Toutes' ? applications.length : (counts[f] ?? 0)
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    border: active ? '1px solid #c9a96e' : '1px solid rgba(13,27,42,0.12)',
                    background: active ? '#0d1b2a' : '#ffffff',
                    color: active ? '#f5f2eb' : '#6b6355',
                  }}
                >
                  {f} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(13,27,42,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: '#e8e3d9' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 4, background: '#e8e3d9', width: '50%', marginBottom: 8 }} />
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
            <p style={{ color: '#ef4444' }}>{error}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />
              </svg>
            </div>
            <p style={{ color: '#0d1b2a', fontWeight: 600, marginBottom: '0.5rem' }}>Aucune demande pour le moment</p>
            <p style={{ color: '#6b6355', fontSize: '0.875rem' }}>
              Les demandes de visite des clients apparaîtront ici.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(app => (
              <div
                key={app.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Client + bien */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: '#c9a96e', color: '#0d1b2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem',
                    }}>
                      {app.user?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontWeight: 600, color: '#0d1b2a', fontSize: '0.95rem' }}>
                        {app.user?.username ?? `Client #${app.user?.id ?? '—'}`}
                      </h3>
                      {app.user?.email && (
                        <p style={{ fontSize: '0.78rem', color: '#6b6355' }}>{app.user.email}</p>
                      )}
                      <p style={{ fontSize: '0.78rem', color: '#6b6355', marginTop: '0.15rem' }}>
                        🏠 {app.listing?.title ?? `Annonce #${app.listing?.id ?? '—'}`}
                        {app.listing?.address?.city && ` — ${app.listing.address.city}`}
                      </p>
                    </div>
                  </div>

                  {/* Statut + date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <StatusBadge label={app.status?.label ?? 'En attente'} />
                    {app.submissionDate && (
                      <p style={{ fontSize: '0.7rem', color: '#6b6355', marginTop: '0.375rem' }}>
                        {new Date(app.submissionDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {app.message && (
                  <p style={{ fontSize: '0.85rem', color: '#4b4639', marginTop: '0.9rem', fontStyle: 'italic' }}>
                    « {app.message} »
                  </p>
                )}

                {/* Actions */}
                <div style={{
                  marginTop: '1rem', paddingTop: '1rem',
                  borderTop: '1px solid rgba(13,27,42,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  {app.listing && (
                    <Link
                      to={`/listings/${app.listing.id}`}
                      style={{ fontSize: '0.85rem', fontWeight: 500, color: '#c9a96e', textDecoration: 'none' }}
                    >
                      Voir l'annonce →
                    </Link>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b6355' }}>
                    Statut :
                    <select
                      value={STATUSES.find(s => s.label === app.status?.label)?.id ?? 1}
                      disabled={savingId === app.id}
                      onChange={(e) => handleStatusChange(app, e.target.value)}
                      style={{
                        padding: '0.4rem 0.7rem', borderRadius: '0.5rem',
                        border: '1px solid rgba(13,27,42,0.15)', background: '#f5f2eb',
                        color: '#0d1b2a', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        opacity: savingId === app.id ? 0.5 : 1,
                      }}
                    >
                      {STATUSES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtre vide */}
        {!loading && !error && applications.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b6355' }}>
            <p>Aucune demande avec le statut « {filter} ».</p>
          </div>
        )}
      </div>
    </div>
  )
}
