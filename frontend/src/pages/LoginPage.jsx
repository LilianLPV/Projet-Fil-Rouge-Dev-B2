import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginByUsername, createUser } from '../api/userService'

export default function LoginPage() {
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')

  useEffect(() => { if (currentUser) navigate('/') }, [currentUser])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
      background: '#0d1b2a',
    }}>
      {/* ── Panneau gauche : visuel ── */}
      <div style={{
        flex: '1 1 55%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3rem',
        minHeight: '100vh',
      }}>
        {/* Photo */}
        <img
          src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=900&fit=crop&auto=format"
          alt="Luxury property"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(13,27,42,0.96) 0%, rgba(13,27,42,0.5) 45%, rgba(13,27,42,0.15) 100%)',
        }} />

        {/* Logo top-left */}
        <div style={{ position: 'absolute', top: '2rem', left: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '0.5rem',
            background: '#c9a96e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: 18, height: 18, color: '#0d1b2a' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21V9l10-7 10 7v12H14v-6h-4v6H2z"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f2eb', letterSpacing: '0.28em' }}>YMMO</span>
        </div>

        {/* Bottom text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.875rem' }}>
            Groupe Ymmo — Depuis 1998
          </p>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 600, color: '#f5f2eb', lineHeight: 1.2, marginBottom: '1rem',
          }}>
            Votre patrimoine,<br />
            <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>notre expertise.</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(245,242,235,0.6)', lineHeight: 1.7, maxWidth: 420 }}>
            Plus de 2 500 biens sélectionnés en France et à Monaco. Accédez à votre espace personnel pour gérer vos démarches immobilières.
          </p>

          {/* Stats mini-bar */}
          <div style={{
            display: 'flex', gap: '2rem', marginTop: '2rem',
            paddingTop: '1.5rem', borderTop: '1px solid rgba(245,242,235,0.12)',
          }}>
            {[
              { value: '2 547', label: 'Biens disponibles' },
              { value: '15', label: 'Agences' },
              { value: '98%', label: 'Satisfaction' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display" style={{ fontSize: '1.35rem', fontWeight: 600, color: '#c9a96e' }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(245,242,235,0.45)', marginTop: '0.15rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div style={{
        flex: '0 0 440px',
        background: '#f5f2eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 2.75rem',
        overflowY: 'auto',
      }}>
        {/* Header form */}
        <div style={{ marginBottom: '2.25rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '0.5rem' }}>
            Bienvenue
          </p>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0d1b2a', marginBottom: '0.375rem' }}>
            {tab === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6355' }}>
            {tab === 'login'
              ? 'Accédez à votre espace YMMO.'
              : 'Rejoignez la plateforme YMMO en tant que client.'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', marginBottom: '2rem',
          background: '#e8e3d9', borderRadius: '0.625rem', padding: '0.25rem',
        }}>
          {[
            { key: 'login',    label: 'Se connecter' },
            { key: 'register', label: 'Créer un compte' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '0.625rem', borderRadius: '0.375rem',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                background: tab === t.key ? '#ffffff' : 'transparent',
                color: tab === t.key ? '#0d1b2a' : '#6b6355',
                boxShadow: tab === t.key ? '0 1px 4px rgba(13,27,42,0.1)' : 'none',
                transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {tab === 'login'
          ? <LoginForm login={login} navigate={navigate} />
          : <RegisterForm login={login} navigate={navigate} switchTab={() => setTab('login')} />
        }

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(13,27,42,0.3)', marginTop: '2.5rem' }}>
          © {new Date().getFullYear()} Groupe Ymmo — Tous droits réservés
        </p>
      </div>
    </div>
  )
}

/* ─────────────────── CONNEXION ─────────────────── */
function LoginForm({ login, navigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) { setError("Veuillez entrer votre nom d'utilisateur."); return }
    setLoading(true); setError('')
    try {
      const user = await loginByUsername(username.trim())
      if (!user) { setError("Aucun compte trouvé avec ce nom d'utilisateur."); return }
      login(user); navigate('/')
    } catch {
      setError('Impossible de se connecter. Le serveur est-il démarré ?')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#dc2626',
        }}>
          <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <Field label="Nom d'utilisateur">
        <LightInput
          autoFocus
          placeholder="ex : pierre.dupont"
          value={username}
          onChange={e => { setUsername(e.target.value); setError('') }}
          autoComplete="username"
          hasError={!!error}
        />
      </Field>

      <Field label="Mot de passe">
        <LightInput
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <p style={{ fontSize: '0.75rem', color: '#6b6355', marginTop: '0.625rem' }}>
          Comptes démo :{' '}
          {['admin', 'sophie.martin', 'pierre.dupont'].map(u => (
            <button
              key={u}
              type="button"
              onClick={() => setUsername(u)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: 'rgba(201,169,110,0.12)', color: '#92600a',
                border: '1px solid rgba(201,169,110,0.25)', borderRadius: '0.3rem',
                padding: '0.1rem 0.45rem', fontSize: '0.72rem', fontWeight: 500,
                cursor: 'pointer', marginLeft: '0.3rem',
              }}
            >
              {u}
            </button>
          ))}
        </p>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold"
        style={{ justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem', marginTop: '0.5rem', width: '100%' }}
      >
        {loading ? (
          <svg style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        )}
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

/* ─────────────────── INSCRIPTION ─────────────────── */
function RegisterForm({ login, navigate, switchTab }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Champ requis'
    else if (form.username.length < 3) e.username = '3 caractères minimum'
    if (!form.email.trim()) e.email = 'Champ requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide'
    if (!form.password) e.password = 'Champ requis'
    else if (form.password.length < 6) e.password = '6 caractères minimum'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      const created = await createUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      login(created); navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg?.includes('username')) setErrors(p => ({ ...p, username: "Ce nom est déjà pris." }))
      else if (msg?.includes('email')) setErrors(p => ({ ...p, email: 'Cet email est déjà utilisé.' }))
      else setGlobalError('Erreur lors de la création du compte.')
    } finally { setLoading(false) }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 9 ? 2 : form.password.length < 12 ? 3 : 4
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabel = ['', 'Trop court', 'Faible', 'Moyen', 'Fort']

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {globalError && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#dc2626' }}>
          {globalError}
        </div>
      )}

      <Field label="Nom d'utilisateur *" error={errors.username}>
        <LightInput placeholder="jean.dupont" value={form.username} onChange={set('username')} autoComplete="username" hasError={!!errors.username} />
      </Field>

      <Field label="Adresse email *" error={errors.email}>
        <LightInput type="email" placeholder="jean@email.com" value={form.email} onChange={set('email')} autoComplete="email" hasError={!!errors.email} />
      </Field>

      <Field label="Mot de passe *" error={errors.password}>
        <LightInput type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="new-password" hasError={!!errors.password} />
        {form.password && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '0.3rem' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: i <= strength ? strengthColor[strength] : '#e8e3d9',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: strengthColor[strength], fontWeight: 500 }}>{strengthLabel[strength]}</p>
          </div>
        )}
      </Field>

      <Field label="Confirmer le mot de passe *" error={errors.confirm}>
        <LightInput type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" hasError={!!errors.confirm} />
        {form.confirm && form.password === form.confirm && !errors.confirm && (
          <p style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg style={{ width: 12, height: 12 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mots de passe identiques
          </p>
        )}
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold"
        style={{ justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem', marginTop: '0.25rem', width: '100%' }}
      >
        {loading ? 'Création…' : 'Créer mon compte'}
      </button>
    </form>
  )
}

/* ─── Helpers ─── */
function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.72rem', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem',
        color: error ? '#dc2626' : '#6b6355',
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.3rem' }}>{error}</p>}
    </div>
  )
}

function LightInput({ hasError, ...props }) {
  return (
    <input
      {...props}
      style={{
        background: '#ffffff',
        border: `1px solid ${hasError ? 'rgba(220,38,38,0.4)' : 'rgba(13,27,42,0.12)'}`,
        borderRadius: '0.5rem',
        color: '#0d1b2a',
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onFocus={e => {
        e.target.style.borderColor = '#c9a96e'
        e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.1)'
      }}
      onBlur={e => {
        e.target.style.borderColor = hasError ? 'rgba(220,38,38,0.4)' : 'rgba(13,27,42,0.12)'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}
