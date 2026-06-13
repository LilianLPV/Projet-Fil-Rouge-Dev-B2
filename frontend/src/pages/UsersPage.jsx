import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, createUser, updateUser, deleteUser } from '../api/userService'
import { getAgencies } from '../api/agencyService'
import { useAuth } from '../context/AuthContext'

const ROLE_BADGE = {
  admin:  { bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)'  },
  agent:  { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', border: 'rgba(59,130,246,0.25)' },
  client: { bg: 'rgba(22,163,74,0.1)',  color: '#16a34a', border: 'rgba(22,163,74,0.25)'  },
}

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

const LightInput = ({ hasError, ...props }) => (
  <input
    {...props}
    style={{ ...inputStyle, borderColor: hasError ? 'rgba(239,68,68,0.5)' : 'rgba(13,27,42,0.12)' }}
    onFocus={e => e.target.style.borderColor = '#c9a96e'}
    onBlur={e => e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.4)' : 'rgba(13,27,42,0.12)'}
  />
)

const LightSelect = ({ children, ...props }) => (
  <select
    {...props}
    style={inputStyle}
    onFocus={e => e.target.style.borderColor = '#c9a96e'}
    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
  >
    {children}
  </select>
)

export default function UsersPage() {
  const { currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', roleId: '', agencyId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser || !isAdmin()) { navigate('/'); return }
    Promise.all([getUsers(), getAgencies(), fetch('/api/roles').then(r => r.ok ? r.json() : [])])
      .then(([us, ags, rs]) => { setUsers(us); setAgencies(ags); setRoles(rs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentUser])

  const reset = () => { setForm({ username: '', email: '', password: '', roleId: '', agencyId: '' }); setEditing(null) }

  const startEdit = (u) => {
    setEditing(u.id)
    setForm({ username: u.username, email: u.email, password: '', roleId: u.role?.id ?? '', agencyId: u.agency?.id ?? '' })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        username: form.username, email: form.email,
        ...(form.password && { password: form.password }),
        ...(form.roleId && { role: { id: Number(form.roleId) } }),
        ...(form.agencyId && { agency: { id: Number(form.agencyId) } }),
      }
      if (editing) {
        const updated = await updateUser(editing, payload)
        setUsers(us => us.map(u => u.id === editing ? updated : u))
      } else {
        if (!form.password) { alert('Mot de passe requis.'); setSaving(false); return }
        const created = await createUser(payload)
        setUsers(us => [...us, created])
      }
      setShowForm(false); reset()
    } catch { alert('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await deleteUser(id)
    setUsers(us => us.filter(u => u.id !== id))
  }

  if (!currentUser || !isAdmin()) return null

  if (loading) return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #c9a96e', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Dark header */}
      <div style={{ background: '#0d1b2a', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                Administration
              </p>
              <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f5f2eb' }}>Utilisateurs</h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.55)', marginTop: '0.25rem' }}>
                {users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={() => { setShowForm(true); reset() }} className="btn-gold">
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Form */}
        {showForm && (
          <div style={{
            background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem',
            marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
            border: '1px solid rgba(201,169,110,0.2)',
          }}>
            <h2 style={{ fontWeight: 600, color: '#0d1b2a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', display: 'inline-block' }} />
              {editing ? 'Modifier' : 'Créer'} un utilisateur
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                  Nom d'utilisateur *
                </label>
                <LightInput required placeholder="jean.dupont" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                  Email *
                </label>
                <LightInput required type="email" placeholder="jean@ymmo.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                  Mot de passe {!editing && '*'}
                </label>
                <LightInput type="password" placeholder={editing ? 'Laisser vide = inchangé' : '••••••••'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                  Rôle
                </label>
                <LightSelect value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                </LightSelect>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
                  Agence
                </label>
                <LightSelect value={form.agencyId} onChange={e => setForm(f => ({ ...f, agencyId: e.target.value }))}>
                  <option value="">— Aucune —</option>
                  {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </LightSelect>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} className="btn-gold" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 2px 12px rgba(13,27,42,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(13,27,42,0.07)', background: '#f5f2eb' }}>
                {['Utilisateur', 'Email', 'Rôle', 'Agence', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0.875rem 1rem',
                    fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#c9a96e',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const rn = u.role?.roleName?.toLowerCase() ?? ''
                const rs = ROLE_BADGE[rn] ?? { bg: 'rgba(107,99,85,0.1)', color: '#6b6355', border: 'rgba(107,99,85,0.2)' }
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: idx > 0 ? '1px solid rgba(13,27,42,0.05)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #c9a96e, #d4bc8a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.75rem', color: '#0d1b2a',
                        }}>
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: '#0d1b2a' }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#6b6355' }}>{u.email}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.role ? (
                        <span style={{
                          fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 500,
                          background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                        }}>
                          {u.role.roleName}
                        </span>
                      ) : <span style={{ color: '#6b6355' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#6b6355' }}>{u.agency?.name ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(u)} style={{
                          fontSize: '0.8rem', fontWeight: 500, color: '#c9a96e',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(u.id)} style={{
                          fontSize: '0.8rem', fontWeight: 500, color: '#dc2626',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#6b6355', fontSize: '0.875rem' }}>
              Aucun utilisateur.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
