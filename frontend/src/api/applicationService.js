import axios from 'axios'

const BASE = '/api/applications'

export const getApplications = () => axios.get(BASE).then(r => r.data)
export const getApplication = (id) => axios.get(`${BASE}/${id}`).then(r => r.data)
export const getApplicationsByUser = (userId) => axios.get(`${BASE}/user/${userId}`).then(r => r.data)
export const getApplicationsByListing = (listingId) => axios.get(`${BASE}/listing/${listingId}`).then(r => r.data)
export const createApplication = (data) => axios.post(BASE, data).then(r => r.data)
export const updateApplication = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data)
export const deleteApplication = (id) => axios.delete(`${BASE}/${id}`)
