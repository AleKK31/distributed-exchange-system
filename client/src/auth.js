const TOKEN_KEY = 'exchange_token'
const USER_KEY = 'exchange_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}
