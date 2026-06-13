import axios from 'axios'

const BASE = '/api/stats'

export const getKpis           = () => axios.get(`${BASE}/kpis`).then(r => r.data)
export const getByType         = () => axios.get(`${BASE}/by-type`).then(r => r.data)
export const getByStatus       = () => axios.get(`${BASE}/by-status`).then(r => r.data)
export const getByAgency       = () => axios.get(`${BASE}/by-agency`).then(r => r.data)
export const getAvgPriceByCity = () => axios.get(`${BASE}/avg-price-by-city`).then(r => r.data)
export const getDpe            = () => axios.get(`${BASE}/dpe`).then(r => r.data)
export const getListingsByMonth= () => axios.get(`${BASE}/listings-by-month`).then(r => r.data)
export const getTopListings    = () => axios.get(`${BASE}/top-listings`).then(r => r.data)
export const getPriceStats     = () => axios.get(`${BASE}/price-stats`).then(r => r.data)
