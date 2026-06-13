import axios from 'axios'

const BASE = '/api/listings'

export const getListings = (params) => axios.get(BASE, { params }).then(r => r.data)
export const getListing = (id) => axios.get(`${BASE}/${id}`).then(r => r.data)
export const createListing = (data) => axios.post(BASE, data).then(r => r.data)
export const updateListing = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data)
export const deleteListing = (id) => axios.delete(`${BASE}/${id}`)
