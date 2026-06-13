import axios from 'axios'

const BASE = '/api/users'

export const getUsers = () => axios.get(BASE).then(r => r.data)
export const getUser = (id) => axios.get(`${BASE}/${id}`).then(r => r.data)
export const createUser = (data) => axios.post(BASE, data).then(r => r.data)
export const updateUser = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data)
export const deleteUser = (id) => axios.delete(`${BASE}/${id}`)

// Connexion par username — le backend n'a pas d'endpoint auth donc on cherche dans la liste
export const loginByUsername = async (username) => {
  const users = await getUsers()
  const found = users.find(u => u.username.toLowerCase() === username.toLowerCase())
  return found ?? null
}
