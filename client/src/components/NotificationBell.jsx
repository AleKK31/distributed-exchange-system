/**
 * Sino de notificações da navbar. Mostra o contador de não lidas e, ao clicar,
 * abre um dropdown com a lista; clicar numa notificação a marca como lida.
 * Fecha ao clicar fora.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 04/07/2026
 * Atualização: 07/07/2026
 */
import { useEffect, useRef, useState } from 'react'
import { useNotificacoes } from '../context/NotificacoesContext'

/**
 * Renderiza o sino de notificações com o dropdown.
 * @returns {JSX.Element} Elemento do sino de notificações.
 */
export default function NotificationBell() {
  const { notificacoes, naoLidasCount, marcarLida } = useNotificacoes()
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!aberto) return

    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [aberto])

  // Marca a notificação como lida, ignorando eventual erro de rede.
  function handleMarcarLida(id) {
    marcarLida(id).catch(() => {})
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setAberto((v) => !v)}
        className="relative hover:opacity-80 cursor-pointer"
        aria-label="Notificações"
      >
        <span className="text-lg">🔔</span>
        {naoLidasCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {naoLidasCount > 9 ? '9+' : naoLidasCount}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white text-gray-800 rounded-lg shadow-xl z-50">
          {notificacoes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma notificação</p>
          )}
          {notificacoes.map((n) => (
            <button
              key={n.id}
              onClick={() => handleMarcarLida(n.id)}
              className={`block w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                n.lida ? 'text-gray-500' : 'text-gray-800 font-medium bg-indigo-50'
              }`}
            >
              <p className="text-sm">{n.mensagem}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString('pt-BR')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
