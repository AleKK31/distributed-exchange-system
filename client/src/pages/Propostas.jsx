/**
 * Página de propostas. Lista as propostas de troca do usuário, carrega os itens
 * das publicações envolvidas e permite aceitar ou recusar quando pendente.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { getUser, isLoggedIn } from '../auth'

const propostaStatusConfig = {
  pendente:  { label: 'Pendente',   cls: 'bg-yellow-100 text-yellow-700' },
  aceito:    { label: 'Aceita',     cls: 'bg-green-100 text-green-700' },
  recusado:  { label: 'Recusada',   cls: 'bg-red-100 text-red-500' },
  expirado:  { label: 'Expirada',   cls: 'bg-gray-100 text-gray-500' },
  cancelado: { label: 'Cancelada',  cls: 'bg-gray-100 text-gray-500' },
}

const respostaConfig = {
  pendente:  { label: 'Aguardando sua resposta', cls: 'text-yellow-600' },
  aceito:    { label: 'Você aceitou',            cls: 'text-green-600' },
  recusado:  { label: 'Você recusou',            cls: 'text-red-500' },
}

/**
 * Renderiza a página de propostas de troca do usuário.
 * @returns {JSX.Element} Página de propostas.
 */
export default function Propostas() {
  const navigate = useNavigate()
  const user     = getUser()

  const [propostas, setPropostas] = useState([])
  const [pubs, setPubs]           = useState({}) // id → Publicacao
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [respondendo, setRespondendo] = useState(null) // id em loading

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    carregar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Carrega as propostas do usuário e as publicações relacionadas.
  async function carregar() {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/match/minhas')
      const lista = res.data ?? []
      setPropostas(lista)
      await carregarPublicacoes(lista)
    } catch {
      setError('Não foi possível carregar suas propostas.')
    } finally {
      setLoading(false)
    }
  }

  // Busca em paralelo as publicações citadas nas propostas e as indexa por id.
  async function carregarPublicacoes(lista) {
    const ids = [...new Set(lista.flatMap((p) => [p.publicacao_a_id, p.publicacao_b_id]))]
    const resultados = await Promise.allSettled(ids.map((id) => apiFetch(`/publicacoes/${id}`)))
    const mapa = {}
    resultados.forEach((r, i) => {
      if (r.status === 'fulfilled') mapa[ids[i]] = r.value.data
    })
    setPubs(mapa)
  }

  // Envia a resposta (aceitar/recusar) à proposta e atualiza a lista.
  async function responder(id, acao) {
    setRespondendo(id)
    try {
      const res = await apiFetch(`/match/${id}/${acao}`, { method: 'POST' })
      setPropostas((prev) => prev.map((p) => (p.id === id ? res.data : p)))
    } catch {
      setError('Erro ao registrar resposta. Tente novamente.')
    } finally {
      setRespondendo(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Minhas propostas</h1>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse h-28" />
          ))}
        </div>
      )}

      {!loading && propostas.length === 0 && !error && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Você ainda não tem propostas de troca.</p>
          <p className="text-sm mt-1">Publique um item e aguarde um match!</p>
        </div>
      )}

      {!loading && propostas.length > 0 && (
        <div className="space-y-4">
          {propostas.map((proposta) => {
            const souA         = proposta.usuario_a_id === user?.id
            const minhaPubId   = souA ? proposta.publicacao_a_id : proposta.publicacao_b_id
            const outraPubId   = souA ? proposta.publicacao_b_id : proposta.publicacao_a_id
            const minhaResposta = souA ? proposta.resposta_a : proposta.resposta_b
            const outraResposta = souA ? proposta.resposta_b : proposta.resposta_a

            const minhaPub  = pubs[minhaPubId]
            const outraPub  = pubs[outraPubId]

            const podaResponder =
              proposta.status === 'pendente' && minhaResposta === 'pendente'

            const statusCfg   = propostaStatusConfig[proposta.status] ?? propostaStatusConfig.pendente
            const respostaCfg = respostaConfig[minhaResposta] ?? respostaConfig.pendente

            return (
              <div key={proposta.id} className="bg-white rounded-xl shadow p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>
                    {statusCfg.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Itens */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-indigo-400 font-medium mb-1">Seu item</p>
                    {minhaPub ? (
                      <>
                        <p className="text-sm font-semibold text-gray-800 truncate">{minhaPub.item_oferto}</p>
                        <p className="text-xs text-gray-500 truncate">Quer: {minhaPub.item_desejado}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Carregando...</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-medium mb-1">Item da outra parte</p>
                    {outraPub ? (
                      <>
                        <p className="text-sm font-semibold text-gray-800 truncate">{outraPub.item_oferto}</p>
                        <p className="text-xs text-gray-500 truncate">Quer: {outraPub.item_desejado}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Carregando...</p>
                    )}
                  </div>
                </div>

                {/* Resposta e ações */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${respostaCfg.cls}`}>{respostaCfg.label}</p>
                    {outraResposta !== 'pendente' && proposta.status === 'pendente' && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Outra parte: {outraResposta === 'aceito' ? 'aceitou' : 'recusou'}
                      </p>
                    )}
                  </div>

                  {podaResponder && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => responder(proposta.id, 'recusar')}
                        disabled={respondendo === proposta.id}
                        className="px-4 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => responder(proposta.id, 'aceitar')}
                        disabled={respondendo === proposta.id}
                        className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {respondendo === proposta.id ? 'Aguarde...' : 'Aceitar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
