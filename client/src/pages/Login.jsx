/**
 * Página de login. Autentica o usuário via API, guarda token e dados e
 * redireciona para a Home; já loga direto se houver sessão ativa.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { isLoggedIn, setToken, setUser } from '../auth'

/**
 * Renderiza o formulário de login.
 * @returns {JSX.Element} Página de login.
 */
export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) navigate('/')
  }, [navigate])

  // Atualiza o campo do formulário conforme o input alterado.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Envia as credenciais, salva a sessão e redireciona; trata erro de login.
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      setToken(res.token)
      setUser(res.user)
      navigate('/')
    } catch (err) {
      setError(err.status === 401 ? 'E-mail ou senha incorretos.' : 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">Cadastrar</Link>
        </p>
      </form>
    </div>
  )
}
