import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const BASE = '/analytics-api'
const NAVY  = '#0d1b2a'
const GOLD  = '#c9a96e'
const CREAM = '#f5f2eb'

// ── Images disponibles avec leur label ────────────────────────────────────────
const IMAGES = [
  { file: 'dashboard_recap.png',    label: 'Vue d\'ensemble',          span: 2 },
  { file: 'prix_par_ville.png',     label: 'Prix moyen par ville',     span: 1 },
  { file: 'types_biens.png',        label: 'Types de biens',           span: 1 },
  { file: 'biens_par_agence.png',   label: 'Biens par agence',         span: 1 },
  { file: 'distribution_dpe.png',   label: 'Distribution DPE',         span: 1 },
  { file: 'tendance_prix.png',      label: 'Tendance & prévisions',    span: 2 },
]

// ── Composants ────────────────────────────────────────────────────────────────
function KpiTile({ label, value, icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(201,169,110,0.18)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: CREAM, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: GOLD, fontWeight: 600, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

function StatusBanner({ status, error, onRefresh, refreshing }) {
  const cfg = {
    pending: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', icon: '⏳', text: 'En attente de démarrage…' },
    running: { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', icon: '🔄', text: 'Analyse en cours, chargement des données…' },
    done:    { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', icon: '✅', text: 'Analyse terminée avec succès' },
    error:   { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', icon: '❌', text: `Erreur : ${error}` },
  }[status] ?? { bg: 'transparent', color: CREAM, icon: '…', text: status }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: cfg.bg, border: `1px solid ${cfg.color}33`,
      borderRadius: 10, padding: '12px 18px', marginBottom: 28,
    }} role="status" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{cfg.icon}</span>
        <span style={{ color: cfg.color, fontSize: 14, fontWeight: 500 }}>{cfg.text}</span>
      </div>
      {status !== 'running' && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Relancer l'analyse"
          style={{
            background: 'rgba(201,169,110,0.15)', border: `1px solid ${GOLD}40`,
            color: GOLD, borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.5 : 1,
          }}
        >
          {refreshing ? 'Lancement…' : '↺ Relancer l\'analyse'}
        </button>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [status,      setStatus]      = useState('pending')
  const [error,       setError]       = useState(null)
  const [summary,     setSummary]     = useState(null)
  const [images,      setImages]      = useState([])
  const [refreshing,  setRefreshing]  = useState(false)
  const [activeImage, setActiveImage] = useState(null) // modal

  // ── Polling du statut ──
  const checkStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE}/status`)
      setStatus(data.status)
      setError(data.error)
      if (data.status === 'done') {
        // Charger le summary et les images disponibles
        const [sumRes, imgRes] = await Promise.allSettled([
          axios.get(`${BASE}/summary`),
          axios.get(`${BASE}/images`),
        ])
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data)
        if (imgRes.status === 'fulfilled') setImages(imgRes.value.data)
      }
    } catch {
      // Flask pas encore démarré
      setStatus('pending')
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Relancer le polling si en cours
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(checkStatus, 3000)
    return () => clearInterval(id)
  }, [status, checkStatus])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await axios.post(`${BASE}/refresh`)
      setStatus('running')
      setSummary(null)
    } catch {
      alert('Impossible de contacter le serveur Python. Vérifiez que app.py est lancé (python python/app.py).')
    } finally {
      setRefreshing(false)
    }
  }

  // Filtrer les images effectivement disponibles
  const availableImages = IMAGES.filter(img => images.includes(img.file))

  return (
    <main style={{ background: CREAM, minHeight: '100vh' }} id="main-content">
      {/* ── En-tête ── */}
      <header style={{ background: NAVY, padding: '48px 0 52px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: GOLD, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Analyse Python
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: CREAM, fontSize: 'clamp(24px,4vw,38px)', fontWeight: 700, margin: '0 0 8px' }}>
            Intelligence analytique
          </h1>
          <p style={{ color: 'rgba(245,242,235,0.55)', fontSize: 14, margin: 0 }}>
            Rapports générés par le script Python — pandas · matplotlib · numpy
          </p>

          {/* KPIs */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 28 }}>
              <KpiTile icon="🏠" label="Biens analysés"  value={(summary.kpis.total_listings ?? 0).toLocaleString('fr-FR')} />
              <KpiTile icon="📋" label="Demandes"         value={(summary.kpis.total_applications ?? 0).toLocaleString('fr-FR')} />
              <KpiTile icon="🏢" label="Agences"          value={(summary.kpis.total_agencies ?? 0).toLocaleString('fr-FR')} />
              <KpiTile icon="💶" label="Prix moyen"       value={`${(summary.kpis.avg_price ?? 0).toLocaleString('fr-FR')} €`} />
              <KpiTile icon="📈" label="Tendance marché"
                value={summary.trend?.direction === 'hausse' ? '↗ Hausse' : summary.trend?.direction === 'baisse' ? '↘ Baisse' : '–'}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Corps ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 60px' }}>
        <StatusBanner
          status={status}
          error={error}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Spinner si en cours */}
        {status === 'running' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 52, height: 52, border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#6b7280', fontSize: 14 }}>Connexion PostgreSQL, traitement des données, génération des graphiques…</p>
          </div>
        )}

        {/* Message si serveur Python pas démarré */}
        {status === 'pending' && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '36px', textAlign: 'center', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🐍</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontSize: 20, marginBottom: 12 }}>
              Serveur Python non démarré
            </h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
              Le script d'analyse Python doit être lancé séparément. Ouvre un terminal et exécute :
            </p>
            <code style={{ display: 'block', background: NAVY, color: GOLD, padding: '14px 20px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', maxWidth: 400, margin: '0 auto' }}>
              cd python<br />
              python app.py
            </code>
          </div>
        )}

        {/* Résumé textuel */}
        {summary && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {/* Top villes */}
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontSize: 16, marginBottom: 16, fontWeight: 700 }}>
                  💰 Prix moyen par ville
                </h3>
                {Object.entries(summary.avg_price_by_city ?? {}).slice(0, 5).map(([ville, prix], i) => (
                  <div key={ville} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#374151', fontSize: 13 }}>
                      <span style={{ color: GOLD, fontWeight: 700, marginRight: 8 }}>{i+1}.</span>{ville}
                    </span>
                    <span style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontWeight: 700, fontSize: 14 }}>
                      {prix.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Tendance */}
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontSize: 16, marginBottom: 16, fontWeight: 700 }}>
                  📈 Analyse de tendance
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Direction</p>
                    <p style={{ color: summary.trend?.direction === 'hausse' ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: 18 }}>
                      {summary.trend?.direction === 'hausse' ? '↗ Marché en hausse' : summary.trend?.direction === 'baisse' ? '↘ Marché en baisse' : '— Données insuffisantes'}
                    </p>
                  </div>
                  {(summary.trend?.monthly_change ?? 0) > 0 && (
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                      <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Publications / mois</p>
                      <p style={{ color: NAVY, fontWeight: 700, fontSize: 18, fontFamily: 'Playfair Display, serif' }}>
                        +{summary.trend.monthly_change} biens / mois
                      </p>
                    </div>
                  )}
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Mois analysés</p>
                    <p style={{ color: NAVY, fontSize: 13, fontWeight: 500 }}>
                      {summary.trend?.nb_months ?? 0} mois de données
                    </p>
                  </div>
                </div>
              </div>

              {/* DPE */}
              {Object.keys(summary.dpe ?? {}).length > 0 && (
                <div style={{ background: '#fff', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(13,27,42,0.07)' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontSize: 16, marginBottom: 16, fontWeight: 700 }}>
                    🏷️ Classes DPE
                  </h3>
                  {Object.entries(summary.dpe ?? {}).sort().map(([cls, nb]) => {
                    const clrs = { A:'#22c55e', B:'#84cc16', C:'#eab308', D:'#f97316', E:'#ef4444', F:'#dc2626', G:'#7f1d1d' }
                    const total = Object.values(summary.dpe ?? {}).reduce((a, b) => a + b, 0)
                    const pct = Math.round(nb / total * 100)
                    return (
                      <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: clrs[cls]||GOLD, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{cls}</span>
                        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: clrs[cls]||GOLD, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, minWidth: 28 }}>{nb}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Graphiques PNG */}
            {availableImages.length > 0 && (
              <>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: NAVY, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  Graphiques générés
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  {availableImages.map(img => (
                    <div
                      key={img.file}
                      style={{ gridColumn: img.span === 2 ? 'span 2' : 'span 1' }}
                    >
                      <div
                        onClick={() => setActiveImage(img)}
                        role="button"
                        aria-label={`Agrandir : ${img.label}`}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setActiveImage(img)}
                        style={{
                          background: '#fff', borderRadius: 14, overflow: 'hidden',
                          boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
                          cursor: 'zoom-in', transition: 'box-shadow 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(13,27,42,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,27,42,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <div style={{ background: NAVY, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: GOLD, fontWeight: 600, fontSize: 13 }}>{img.label}</span>
                          <span style={{ color: 'rgba(245,242,235,0.4)', fontSize: 11 }}>Cliquer pour agrandir</span>
                        </div>
                        <img
                          src={`${BASE}/images/${img.file}?t=${Date.now()}`}
                          alt={img.label}
                          style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'contain', background: NAVY }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* ── Modal zoom image ── */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Graphique agrandi : ${activeImage.label}`}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(13,27,42,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <div style={{ background: NAVY, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: GOLD, fontWeight: 600 }}>{activeImage.label}</span>
                <button
                  onClick={() => setActiveImage(null)}
                  aria-label="Fermer"
                  style={{ background: 'transparent', border: 'none', color: 'rgba(245,242,235,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
                >×</button>
              </div>
              <img
                src={`${BASE}/images/${activeImage.file}?t=${Date.now()}`}
                alt={activeImage.label}
                style={{ display: 'block', maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
