import { useState } from 'react'
import { Link } from 'react-router-dom'

const getPhoto = (listing) => {
  if (listing.mainPicture?.picture) return listing.mainPicture.picture
  return `https://picsum.photos/seed/ymmo-${listing.id}/800/500`
}

const DPE_COLOR = { A:'#22c55e', B:'#84cc16', C:'#eab308', D:'#f97316', E:'#ef4444', F:'#dc2626', G:'#991b1b' }

const STATUS_STYLE = {
  'disponible':      { bg: 'rgba(13,27,42,0.82)', color: '#f5f2eb' },
  'sous compromis':  { bg: 'rgba(224,123,57,0.9)', color: '#fff' },
  'vendu':           { bg: 'rgba(192,57,43,0.9)',  color: '#fff' },
  'loué':            { bg: 'rgba(139,94,131,0.9)', color: '#fff' },
}

export default function ListingCard({ listing }) {
  const [hovered, setHovered] = useState(false)
  const img = getPhoto(listing)
  const city = listing.address?.city
  const price = listing.price ? Number(listing.price).toLocaleString('fr-FR') : '—'
  const isRental = listing.type?.label?.toLowerCase() === 'location'
  const statusKey = (listing.status?.label ?? '').toLowerCase()
  const statusStyle = STATUS_STYLE[statusKey] ?? { bg: 'rgba(13,27,42,0.82)', color: '#f5f2eb' }

  return (
    <Link
      to={`/listings/${listing.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: '#ffffff',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: hovered ? '0 20px 60px rgba(13,27,42,0.14)' : '0 2px 12px rgba(13,27,42,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#e8e3d9' }}>
        <img
          src={img}
          alt={listing.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
          loading="lazy"
          onError={e => { e.target.src = `https://picsum.photos/seed/house-${listing.id}/800/500` }}
        />

        {/* Status badge */}
        {listing.status && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            padding: '0.25rem 0.625rem', borderRadius: '0.25rem',
            fontSize: '0.75rem', fontWeight: 500,
            background: statusStyle.bg, color: statusStyle.color,
          }}>
            {listing.status.label}
          </span>
        )}

        {/* DPE badge */}
        {listing.energyRating && (
          <span style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            width: '1.75rem', height: '1.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            background: DPE_COLOR[listing.energyRating] ?? '#6b7280',
          }}>
            {listing.energyRating}
          </span>
        )}

        {/* Type chip */}
        {listing.type && (
          <span style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            padding: '0.2rem 0.6rem', borderRadius: '0.25rem',
            fontSize: '0.7rem', fontWeight: 500,
            background: 'rgba(201,169,110,0.9)', color: '#0d1b2a',
          }}>
            {listing.type.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        {/* Ref */}
        <p style={{ fontSize: '0.7rem', color: '#c9a96e', letterSpacing: '0.08em', marginBottom: '0.375rem', fontWeight: 500 }}>
          #{String(listing.id).padStart(4, '0')}
        </p>

        {/* Title */}
        <h3
          className="font-display"
          style={{
            fontSize: '1rem', fontWeight: 600, lineHeight: 1.3,
            color: '#0d1b2a', marginBottom: '0.5rem',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {listing.title}
        </h3>

        {/* Location */}
        {city && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#6b6355', marginBottom: '1rem' }}>
            <svg style={{ width: 13, height: 13, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            {city}
          </p>
        )}

        {/* Specs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          paddingBottom: '1rem', marginBottom: '1rem',
          borderBottom: '1px solid rgba(13,27,42,0.07)',
          flexWrap: 'wrap',
        }}>
          {listing.livingArea && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#0d1b2a' }}>
              <svg style={{ width: 13, height: 13, color: '#c9a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
              {listing.livingArea} m²
            </span>
          )}
          {listing.roomCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#0d1b2a' }}>
              <svg style={{ width: 13, height: 13, color: '#c9a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              {listing.roomCount} p.
            </span>
          )}
          {listing.bedroomCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#0d1b2a' }}>
              <svg style={{ width: 13, height: 13, color: '#c9a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 10V8a2 2 0 012-2h14a2 2 0 012 2v2M3 10v9m18-9v9"/>
              </svg>
              {listing.bedroomCount} ch.
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0d1b2a' }}>
              {price} €
              {isRental && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#6b6355', marginLeft: '0.25rem' }}>/mois</span>}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 500,
            background: 'rgba(201,169,110,0.12)', color: '#0d1b2a', transition: 'background 0.15s',
          }}>
            Voir
            <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
