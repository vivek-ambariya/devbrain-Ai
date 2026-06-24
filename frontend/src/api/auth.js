import api from './axios'

export async function login(credentials) {
  const { data } = await api.post('/auth/login/', credentials)
  return data
}

export async function register(userData) {
  const { data } = await api.post('/auth/register/', userData)
  return data
}

export async function refreshToken(refresh) {
  const { data } = await api.post('/auth/refresh/', { refresh })
  return data
}

export async function getProfile() {
  const { data } = await api.get('/auth/profile/')
  return data
}

export async function updateProfile(profileData) {
  const { data } = await api.patch('/auth/profile/', profileData)
  return data
}
