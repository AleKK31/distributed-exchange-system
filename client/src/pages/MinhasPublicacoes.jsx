import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { getUser, isLoggedIn } from '../auth'

const CATEGORIAS = ['Eletrônicos', 'Livros', 'Roupas', 'Esportes', 'Casa', 'Outros']

const EMPTY_FORM = { item_oferto: '', item_desejado: '', categoria: '', descricao: '' }

const statusBadge = {
  disponivel: 'bg-green-100 text-green-700',
  negociando: 'bg-yellow-100 text-yellow-700',
  trocado:    'bg-gray-100 text-gray-500',
  removido:   'bg-red-100 text-red-400',
}

export default function MinhasPublicacoes() {
  const navigate  = useNavigate()
  const user      = getUser()

  const [publicacoes, setPublicacoes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  // modal de criação/edição
  const [showForm, setShowForm]   = useState(false)
  const [editando, setEditando]   = useState(null) // Publicacao | null
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  // confirmação de remoção
  const [removendo, setRemovendo] = useState(null) // id | null

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    carregar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function carregar() {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/publicacoes/minhas')
      setPublicacoes(res.data ?? [])
    } catch {
      setError('Não foi possível carregar suas publicações.')
    } finally {
      setLoading(false)
    }
  }

  function abrirCriacao() {
    setEditando(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function abrirEdicao(pub) {
    setEditando(pub)
    setForm({
      item_oferto:  pub.item_oferto,
      item_desejado: pub.item_desejado,
      categoria:    pub.categoria,
      descricao:    pub.descricao ?? '',
    })
    setFormError('')
    setShowForm(true)
  }

  function fecharForm() {
    setShowForm(false)
    setEditando(null)
    setForm(EMPTY_FORM)
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const body = { ...form }
      if (!body.descricao) delete body.descricao

      if (editando) {
        const res = await apiFetch(`/publicacoes/${editando.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
        setPublicacoes((prev) => prev.map((p) => (p.id === editando.id ? res.data : p)))
      } else {
        const res = await apiFetch('/publicacoes', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        setPublicacoes((prev) => [res.data, ...prev])
      }
      fecharForm()
    } catch (err) {
      if (err.status === 400) setFormError('Dados inválidos. Verifique os campos.')
      else if (err.status === 403) setFormError('Você não pode editar esta publicação.')
      else setFormError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemover(id) {
    try {
      await apiFetch(`/publicacoes/${id}`, { method: 'DELETE' })
      setPublicacoes((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Erro ao remover publicação.')
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minhas publicações</h1>
        <button
          onClick={abrirCriacao}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Nova publicação
        </button>
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse h-16" />
          ))}
        </div>
      )}

      {!loading && publicacoes.length === 0 && !error && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Você ainda não tem publicações.</p>
          <button onClick={abrirCriacao} className="mt-2 text-indigo-600 text-sm hover:underline">
            Criar a primeira
          </button>
        </div>
      )}

      {!loading && publicacoes.length > 0 && (
        <div className="space-y-3">
          {publicacoes.map((pub) => (
            <div key={pub.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[pub.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {pub.status}
                  </span>
                  <span className="text-xs text-gray-400">{pub.categoria}</span>
                </div>
                <p className="text-sm text-gray-800 truncate">
                  <span className="font-medium">Oferece:</span> {pub.item_oferto}
                  {' · '}
                  <span className="font-medium">Quer:</span> {pub.item_desejado}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {pub.status === 'disponivel' && (
                  <button
                    onClick={() => abrirEdicao(pub)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition"
                  >
                    Editar
                  </button>
                )}
                {pub.status !== 'removido' && (
                  <button
                    onClick={() => setRemovendo(pub.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criação/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editando ? 'Editar publicação' : 'Nova publicação'}
              </h2>
              <button onClick={fecharForm} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 flex flex-col gap-4">
              {formError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que você oferece</label>
                <input
                  type="text"
                  name="item_oferto"
                  value={form.item_oferto}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que você deseja em troca</label>
                <input
                  type="text"
                  name="item_desejado"
                  value={form.item_desejado}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharForm}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {saving ? 'Salvando...' : editando ? 'Salvar alterações' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de remoção */}
      {removendo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-gray-800 font-semibold mb-2">Remover publicação?</p>
            <p className="text-gray-500 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemovendo(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemover(removendo)}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
