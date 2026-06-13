import axios from 'axios'

const BASE = '/api/agencies'

export const getAgencies = () => axios.get(BASE).then(r => r.data)
export const getAgency = (id) => axios.get(`${BASE}/${id}`).then(r => r.data)
export const createAgency = (data) => axios.post(BASE, data).then(r => r.data)
export const updateAgency = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data)
export const deleteAgency = (id) => axios.delete(`${BASE}/${id}`)
