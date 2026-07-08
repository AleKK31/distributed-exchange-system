/**
 * Cliente HTTP do frontend. Centraliza as chamadas à API (via NGINX em /api),
 * injetando o token JWT no cabeçalho e tratando erros de resposta. Também expõe
 * funções para as notificações.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { getToken } from './auth'

const API_BASE = '/api'

/**
 * Executa uma requisição HTTP à API adicionando o token JWT (se houver) e o
 * cabeçalho JSON, e desserializa a resposta.
 * @param {string} path Caminho relativo do endpoint (ex.: '/notificacoes').
 * @param {object} [options] Opções do fetch (method, body, headers, etc.).
 * @returns {Promise<any>} Corpo da resposta já convertido de JSON.
 * @throws {{status: number, message: string}} Quando a resposta não é ok.
 */
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

/**
 * Busca as notificações do usuário autenticado.
 * @returns {Promise<any>} Lista de notificações retornada pela API.
 */
export async function listarNotificacoes() {
  return apiFetch('/notificacoes')
}

/**
 * Marca uma notificação como lida.
 * @param {string} id Id da notificação.
 * @returns {Promise<any>} Resposta da API após marcar como lida.
 */
export async function marcarNotificacaoLida(id) {
  return apiFetch(`/notificacoes/${id}/lida`, { method: 'PATCH' })
}
