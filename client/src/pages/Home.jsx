import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../api'

const CATEGORIAS = ['Eletrônicos', 'Livros', 'Roupas', 'Esportes', 'Casa', 'Outros']
const LIMIT = 12

const statusBadge = {
  disponivel: 'bg-green-100 text-green-700',
  negociando: 'bg-yellow-100 text-yellow-700',
  trocado:    'bg-gray-100 text-gray-500',
  removido:   'bg-red-100 text-red-400',
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page      = parseInt(searchParams.get('page') || '1', 10)
  const categoria = searchParams.get('categoria') || ''

  const [publicacoes, setPublicacoes] = useState([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams({ status: 'disponivel', page, limit: LIMIT })
    if (categoria) params.set('categoria', categoria)

    apiFetch(`/publicacoes?${params}`)
      .then((res) => {
        setPublicacoes(res.data ?? [])
        setTotal(res.meta?.total ?? res.data?.length ?? 0)
      })
      .catch(() => setError('Não foi possível carregar as publicações.'))
      .finally(() => setLoading(false))
  }, [page, categoria])

  function setPage(p) {
    setSearchParams((prev) => { prev.set('page', p); return prev })
  }

  function setCategoria(c) {
    setSearchParams(c ? { categoria: c, page: 1 } : { page: 1 })
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Publicações disponíveis</h1>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoria('')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            !categoria
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'
          }`}
        >
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              categoria === c
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Estado de erro */}
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && publicacoes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Nenhuma publicação encontrada.</p>
          {categoria && (
            <button
              onClick={() => setCategoria('')}
              className="mt-2 text-indigo-600 text-sm hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>
      )}

      {/* Cards */}
      {!loading && publicacoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {publicacoes.map((pub) => (
            <Link
              key={pub.id}
              to={`/publicacao/${pub.id}`}
              className="bg-white rounded-xl shadow hover:shadow-md transition p-4 flex flex-col gap-2"
            >
              <span
                className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${
                  statusBadge[pub.status] ?? 'bg-gray-100 text-gray-500'
                }`}
              >
                {pub.status}
              </span>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{pub.categoria}</p>
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  Oferece: <span className="font-normal">{pub.item_oferto}</span>
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  Quer: <span className="font-normal">{pub.item_desejado}</span>
                </p>
              </div>
              {pub.descricao && (
                <p className="text-xs text-gray-500 line-clamp-2">{pub.descricao}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
