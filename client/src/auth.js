/**
 * Utilitários de autenticação no cliente. Guardam o token JWT e os dados do
 * usuário no localStorage e disparam o evento 'auth-changed' quando o estado de
 * login muda (usado para (re)conectar o WebSocket de notificações).
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
const TOKEN_KEY = 'exchange_token'
const USER_KEY = 'exchange_user'

/**
 * Retorna o token JWT salvo.
 * @returns {string|null} Token, ou null se não houver.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Salva o token JWT e notifica a mudança de autenticação.
 * @param {string} token Token JWT a armazenar.
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event('auth-changed'))
}

/**
 * Remove token e usuário do storage e notifica a mudança (logout).
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

/**
 * Indica se há um usuário autenticado.
 * @returns {boolean} true se existir token salvo.
 */
export function isLoggedIn() {
  return !!getToken()
}

/**
 * Salva os dados do usuário logado.
 * @param {object} user Dados do usuário.
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Retorna os dados do usuário logado.
 * @returns {object|null} Usuário, ou null se não houver.
 */
export function getUser() {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}
