import { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  getKpis, getByType, getByStatus, getByAgency,
  getAvgPriceByCity, getDpe, getListingsByMonth, getTopListings
} from '../api/statsService'

// ─── Couleurs YMMO ────────────────────────────────────────────────────────────
const NAVY   = '#0d1b2a'
const GOLD   = '#c9a96e'
const CREAM  = '#f5f2eb'
const COLORS = ['#c9a96e','#3d5a80','#e07b4a','#6b4f8a','#2e7d5a','#e5a02a','#8b4513','#4a90d9']
const DPE_COLORS = { A:'#22c55e', B:'#84cc16', C:'#eab308', D:'#f97316', E:'#ef4444', F:'#dc2626', G:'#7f1d1d' }

// ─── Sous-composants ──────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(201,169,110,0.18)',
      borderRadius: 14, padding: '22px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 12,
        background: 'rgba(201,169,110,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: CREAM, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(245,242,235,0.45)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function SectionCard({ title, children, extra }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 14,
      padding: '24px 24px 20px',
      boxShadow: '0 2px 12px rgba(13,27,42,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 17, color: NAVY, fontWeight: 700 }}>{title}</h3>
        {extra}
      </div>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 32 }}>📊</span>
      <span style={{ fontSize: 13 }}>Aucune donnée disponible</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: NAVY, border: `1px solid ${GOLD}`, borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ color: CREAM, fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: GOLD, margin: '2px 0', fontSize: 13 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [kpis,        setKpis]        = useState(null)
  const [byType,      setByType]      = useState([])
  const [byStatus,    setByStatus]    = useState([])
  const [byAgency,    setByAgency]    = useState([])
  const [avgByCity,   setAvgByCity]   = useState([])
  const [dpe,         setDpe]         = useState([])
  const [byMonth,     setByMonth]     = useState([])
  const [topListings, setTopListings] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    Promise.allSettled([
      getKpis().then(setKpis).catch(() => {}),
      getByType().then(setByType).catch(() => {}),
      getByStatus().then(setByStatus).catch(() => {}),
      getByAgency().then(setByAgency).catch(() => {}),
      getAvgPriceByCity().then(d => setAvgByCity(d.slice(0, 10))).catch(() => {}),
      getDpe().then(setDpe).catch(() => {}),
      getListingsByMonth().then(d => setByMonth(d.map(r => ({
        ...r, mois: r.month ? r.month.slice(5) + '/' + r.month.slice(2, 4) : (r.mois ?? '')
      })))).catch(() => {}),
      getTopListings().then(setTopListings).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const dpeData = dpe.map(r => ({
    name: r.rating, value: Number(r.count), fill: DPE_COLORS[r.rating] || GOLD
  }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>Chargement du tableau de bord…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <main style={{ background: CREAM, minHeight: '100vh' }} role="main">
      {/* ── En-tête navy ── */}
      <header style={{ background: NAVY, padding: '48px 0 56px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: GOLD, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Administration
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: CREAM, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, margin: '0 0 32px' }}>
            Tableau de bord analytique
          </h1>

          {kpis && (
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}
              role="region" aria-label="Indicateurs clés de performance"
            >
              <KpiCard icon="🏠" label="Biens au total"      value={kpis.totalListings?.toLocaleString('fr-FR') ?? '–'} />
              <KpiCard icon="📋" label="Demandes reçues"     value={kpis.totalApplications?.toLocaleString('fr-FR') ?? '–'} />
              <KpiCard icon="🏢" label="Agences partenaires" value={kpis.totalAgencies?.toLocaleString('fr-FR') ?? '–'} />
              <KpiCard icon="👥" label="Utilisateurs"        value={kpis.totalUsers?.toLocaleString('fr-FR') ?? '–'} />
              {kpis.avgPrice && (
                <KpiCard icon="💶" label="Prix moyen"
                  value={`${Math.round(kpis.avgPrice).toLocaleString('fr-FR')} €`}
                  sub="Tous biens confondus" />
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Corps cream ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>

        {error && (
          <div role="alert" aria-live="polite" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 18px', color: '#b91c1c', marginBottom: 24, fontSize: 14 }}>
            ⚠️ Certaines données sont indisponibles : {error}
          </div>
        )}

        {/* Ligne 1 : Pie types + Bar statuts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
          <SectionCard title="Répartition par type de bien">
            {byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byType} dataKey="count" nameKey="label"
                       cx="50%" cy="50%" outerRadius={95}
                       labelLine={false} label={renderPieLabel}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#374151' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>

          <SectionCard title="Biens par statut">
            {byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byStatus} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Nb biens" radius={[4,4,0,0]}>
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>
        </div>

        {/* Ligne 2 : Line publications par mois */}
        <div style={{ marginBottom: 24 }}>
          <SectionCard title="Publications par mois (12 derniers mois)">
            {byMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={byMonth} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Publications"
                        stroke={GOLD} strokeWidth={2.5}
                        dot={{ fill: GOLD, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>
        </div>

        {/* Ligne 3 : Bar prix moyen par ville */}
        <div style={{ marginBottom: 24 }}>
          <SectionCard title="Prix moyen par ville — Top 10">
            {avgByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={avgByCity} layout="vertical" margin={{ top: 0, right: 70, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }}
                         tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11, fill: '#374151' }} />
                  <Tooltip content={<CustomTooltip />}
                           formatter={v => [`${Number(v).toLocaleString('fr-FR')} €`, 'Prix moyen']} />
                  <Bar dataKey="avgPrice" name="Prix moyen" radius={[0,4,4,0]}>
                    {avgByCity.map((_, i) => <Cell key={i} fill={i === 0 ? '#e07b4a' : GOLD} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>
        </div>

        {/* Ligne 4 : Bar agences + Bar DPE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
          <SectionCard title="Biens par agence">
            {byAgency.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byAgency} margin={{ top: 5, right: 20, bottom: 35, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="agency" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Nb biens" fill={GOLD} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>

          <SectionCard title="Distribution DPE">
            {dpeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dpeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Nb biens" radius={[4,4,0,0]}>
                    {dpeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </SectionCard>
        </div>

        {/* Ligne 5 : Tableau top biens */}
        {topListings.length > 0 && (
          <SectionCard title="Top biens les plus demandés" extra={
            <span style={{ fontSize: 12, color: '#6b7280', background: '#f9fafb', padding: '4px 10px', borderRadius: 20 }}>
              {topListings.length} biens
            </span>
          }>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
                     role="table" aria-label="Biens les plus demandés">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['#','Titre','Ville','Prix','Demandes'].map(h => (
                      <th key={h} scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topListings.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px', color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ padding: '12px', color: NAVY, fontWeight: 600 }}>{item.title}</td>
                      <td style={{ padding: '12px', color: '#374151' }}>{item.city ?? '–'}</td>
                      <td style={{ padding: '12px', color: NAVY, fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
                        {item.price ? Number(item.price).toLocaleString('fr-FR') + ' €' : '–'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-block', background: 'rgba(201,169,110,0.15)', color: '#92400e', fontWeight: 700, borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
                          {item.nbDemandes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          header > div { padding: 0 16px !important; }
        }
      `}</style>
    </main>
  )
}
