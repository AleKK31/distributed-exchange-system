/**
 * Página de detalhe de uma publicação. Carrega a publicação e o dono a partir
 * do id da URL, com estados de carregamento e de não encontrada.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../api'

const statusConfig = {
  disponivel: { label: 'Disponível',  cls: 'bg-green-100 text-green-700' },
  negociando: { label: 'Negociando',  cls: 'bg-yellow-100 text-yellow-700' },
  trocado:    { label: 'Trocado',     cls: 'bg-gray-100 text-gray-500' },
  removido:   { label: 'Removido',    cls: 'bg-red-100 text-red-400' },
}

/**
 * Renderiza o detalhe de uma publicação.
 * @returns {JSX.Element} Página de detalhe da publicação.
 */
export default function PublicacaoDetalhe() {
  const { id } = useParams()

  const [pub, setPub]         = useState(null)
  const [owner, setOwner]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    apiFetch(`/publicacoes/${id}`)
      .then((res) => {
        setPub(res.data)
        return apiFetch(`/users/${res.data.usuario_id}`).catch(() => null)
      })
      .then((userData) => setOwner(userData?.data ?? null))
      .catch((err) => {
        if (err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (notFound || !pub) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Publicação não encontrada</h2>
        <p className="text-gray-500 mb-6">Ela pode ter sido removida ou o link está incorreto.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Voltar para o início</Link>
      </div>
    )
  }

  const status = statusConfig[pub.status] ?? { label: pub.status, cls: 'bg-gray-100 text-gray-500' }
  const createdAt = new Date(pub.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Voltar
      </Link>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{pub.categoria}</p>
            <h1 className="text-xl font-bold text-gray-800">{pub.item_oferto}</h1>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Detalhe de troca */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Oferece</p>
            <p className="text-sm font-semibold text-gray-800">{pub.item_oferto}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Deseja em troca</p>
            <p className="text-sm font-semibold text-gray-800">{pub.item_desejado}</p>
          </div>
        </div>

        {/* Descrição */}
        {pub.descricao && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Descrição</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{pub.descricao}</p>
          </div>
        )}

        {/* Rodapé */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400">
          <span>
            Publicado por{' '}
            <span className="font-medium text-gray-600">{owner?.name ?? 'usuário'}</span>
          </span>
          <span>{createdAt}</span>
        </div>
      </div>
    </div>
  )
}
