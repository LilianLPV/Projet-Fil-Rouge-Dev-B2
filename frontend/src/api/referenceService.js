import axios from 'axios'

export const getListingTypes = () => axios.get('/api/listing-types').then(r => r.data)
export const getListingStatuses = () => axios.get('/api/listing-statuses').then(r => r.data)
