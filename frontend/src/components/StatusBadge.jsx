/* Badges adaptés au thème clair (fond blanc / crème) */
const STYLES = {
  DISPONIBLE:       { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.25)'  },
  VENDU:            { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', border: 'rgba(220,38,38,0.25)'  },
  'SOUS COMPROMIS': { bg: 'rgba(217,119,6,0.1)',   color: '#b45309', border: 'rgba(217,119,6,0.25)'  },
  LOUÉ:             { bg: 'rgba(109,40,217,0.1)',  color: '#7c3aed', border: 'rgba(109,40,217,0.25)' },
  ARCHIVÉ:          { bg: 'rgba(107,99,85,0.1)',   color: '#6b6355', border: 'rgba(107,99,85,0.2)'   },
  ACCEPTÉE:         { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.25)'  },
  REFUSÉE:          { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', border: 'rgba(220,38,38,0.25)'  },
  'EN ATTENTE':     { bg: 'rgba(201,169,110,0.12)', color: '#92600a', border: 'rgba(201,169,110,0.3)' },
  ANNULÉE:          { bg: 'rgba(107,99,85,0.1)',   color: '#6b6355', border: 'rgba(107,99,85,0.2)'   },
}

export default function StatusBadge({ label, size = 'sm' }) {
  const key = label?.toUpperCase().trim()
  const s = STYLES[key] ?? { bg: 'rgba(13,27,42,0.08)', color: '#0d1b2a', border: 'rgba(13,27,42,0.15)' }
  const pad = size === 'sm'
    ? { padding: '0.15rem 0.55rem', fontSize: '0.7rem' }
    : { padding: '0.25rem 0.7rem',  fontSize: '0.8rem'  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: '999px', fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
      ...pad,
    }}>
      {label}
    </span>
  )
}
