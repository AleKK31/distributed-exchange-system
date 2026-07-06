import { getToken } from './auth'

const API_BASE = '/api'

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw { status: res.status, message: error.message || res.statusText }
  }

  return res.json()
}

export async function listarNotificacoes() {
  return apiFetch('/notificacoes')
}

export async function marcarNotificacaoLida(id) {
  return apiFetch(`/notificacoes/${id}/lida`, { method: 'PATCH' })
}
