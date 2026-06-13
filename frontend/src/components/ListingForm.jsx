import { useState, useEffect } from 'react'
import { getListingTypes, getListingStatuses } from '../api/referenceService'
import { getAgencies } from '../api/agencyService'

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const fieldBase = {
  background: '#f5f2eb',
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

const Inp = ({ ...props }) => (
  <input
    {...props}
    style={fieldBase}
    onFocus={e => e.target.style.borderColor = '#c9a96e'}
    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
  />
)
const Sel = ({ children, ...props }) => (
  <select
    {...props}
    style={fieldBase}
    onFocus={e => e.target.style.borderColor = '#c9a96e'}
    onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
  >
    {children}
  </select>
)
const Lbl = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e' }}>
    {children}
  </label>
)

// Aplatit une annonce (entité imbriquée) en champs de formulaire
function flatten(initial = {}) {
  return {
    title:        initial.title        ?? '',
    description:  initial.description   ?? '',
    price:        initial.price         ?? '',
    surface:      initial.livingArea    ?? '',
    rooms:        initial.roomCount     ?? '',
    bedrooms:     initial.bedroomCount  ?? '',
    energyRating: initial.energyRating  ?? '',
    street:       initial.address?.address ?? '',
    city:         initial.address?.city    ?? '',
    zipCode:      initial.address?.zipCode  ?? '',
    addressId:    initial.address?.id   ?? null,
    typeId:       initial.type?.id      ?? '',
    statusId:     initial.status?.id    ?? '',
    agencyId:     initial.agency?.id    ?? '',
  }
}

export default function ListingForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => flatten(initial))
  const [types, setTypes] = useState([])
  const [statuses, setStatuses] = useState([])
  const [agencies, setAgencies] = useState([])

  useEffect(() => {
    getListingTypes().then(setTypes).catch(() => {})
    getListingStatuses().then(setStatuses).catch(() => {})
    getAgencies().then(setAgencies).catch(() => {})
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Construction du payload imbriqué attendu par le backend
    const payload = {
      title:        form.title,
      description:  form.description || null,
      price:        form.price ? Number(form.price) : null,
      roomCount:    form.rooms ? Number(form.rooms) : null,
      bedroomCount: form.bedrooms ? Number(form.bedrooms) : null,
      livingArea:   form.surface ? Number(form.surface) : null,
      energyRating: form.energyRating || null,
      address: {
        ...(form.addressId ? { id: form.addressId } : {}),
        address: form.street,
        city: form.city,
        zipCode: form.zipCode,
      },
      type:   form.typeId   ? { id: Number(form.typeId) }   : null,
      status: form.statusId ? { id: Number(form.statusId) } : null,
      agency: form.agencyId ? { id: Number(form.agencyId) } : null,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Lbl>Titre *</Lbl>
        <Inp required value={form.title} onChange={set('title')} placeholder="Appartement lumineux..." />
      </div>

      <div>
        <Lbl>Description</Lbl>
        <textarea
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="Description du bien..."
          style={{ ...fieldBase, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#c9a96e'}
          onBlur={e => e.target.style.borderColor = 'rgba(13,27,42,0.12)'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Lbl>Prix (€) *</Lbl><Inp required type="number" value={form.price} onChange={set('price')} placeholder="200000" /></div>
        <div><Lbl>Surface (m²)</Lbl><Inp type="number" value={form.surface} onChange={set('surface')} placeholder="65" /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Lbl>Pièces</Lbl><Inp type="number" value={form.rooms} onChange={set('rooms')} placeholder="3" /></div>
        <div><Lbl>Chambres</Lbl><Inp type="number" value={form.bedrooms} onChange={set('bedrooms')} placeholder="2" /></div>
      </div>

      {/* Adresse */}
      <div>
        <Lbl>Adresse *</Lbl>
        <Inp required value={form.street} onChange={set('street')} placeholder="12 rue de la République" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Lbl>Ville *</Lbl><Inp required value={form.city} onChange={set('city')} placeholder="Paris" /></div>
        <div><Lbl>Code postal *</Lbl><Inp required value={form.zipCode} onChange={set('zipCode')} placeholder="75001" /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Lbl>Type *</Lbl>
          <Sel required value={form.typeId} onChange={set('typeId')}>
            <option value="">— Sélectionner —</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Sel>
        </div>
        <div>
          <Lbl>Statut *</Lbl>
          <Sel required value={form.statusId} onChange={set('statusId')}>
            <option value="">— Sélectionner —</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Sel>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Lbl>Agence *</Lbl>
          <Sel required value={form.agencyId} onChange={set('agencyId')}>
            <option value="">— Sélectionner —</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
        </div>
        <div>
          <Lbl>DPE</Lbl>
          <Sel value={form.energyRating} onChange={set('energyRating')}>
            <option value="">— Non renseigné —</option>
            {DPE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </Sel>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-gold flex-1 py-3 justify-center">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
