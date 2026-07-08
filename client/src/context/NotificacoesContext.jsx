/**
 * Contexto React de notificações. Carrega o histórico via API, mantém a conexão
 * WebSocket (socket.io) autenticada por JWT, recebe notificações em tempo real
 * e expõe a lista, a contagem de não lidas, a última nova notificação e a ação
 * de marcar como lida. Reage ao evento 'auth-changed' para conectar/desconectar.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 04/07/2026
 * Atualização: 07/07/2026
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { listarNotificacoes, marcarNotificacaoLida } from '../api'
import { getToken, isLoggedIn } from '../auth'

const NotificacoesContext = createContext(null)

/**
 * Provider que disponibiliza o estado e as ações de notificações à árvore.
 * @param {object} props Propriedades do componente.
 * @param {React.ReactNode} props.children Elementos filhos que consomem o contexto.
 * @returns {JSX.Element} Provider do contexto de notificações.
 */
export function NotificacoesProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState([])
  const [novaNotificacao, setNovaNotificacao] = useState(null)
  const socketRef = useRef(null)
  const idsConhecidosRef = useRef(new Set())
  const conexaoIdRef = useRef(0)

  useEffect(() => {
    if (isLoggedIn()) conectar()

    window.addEventListener('auth-changed', handleAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged)
      desconectar()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Conecta ou desconecta o socket conforme o estado de login mudou.
  function handleAuthChanged() {
    if (isLoggedIn()) {
      conectar()
    } else {
      desconectar()
      setNotificacoes([])
      idsConhecidosRef.current = new Set()
    }
  }

  // Carrega o histórico via API e abre o socket, tratando notificações novas
  // e atualizações de notificações já conhecidas (evita duplicar o replay).
  async function conectar() {
    if (socketRef.current) return
    const conexaoId = ++conexaoIdRef.current

    let lista = []
    try {
      const res = await listarNotificacoes()
      lista = res.data ?? []
    } catch {
      lista = []
    }

    if (conexaoId !== conexaoIdRef.current) return

    setNotificacoes(lista)
    idsConhecidosRef.current = new Set(lista.map((n) => n.id))

    const socket = io({ path: '/socket.io', auth: { token: getToken() } })

    socket.on('notificacao', (notificacao) => {
      const conhecida = idsConhecidosRef.current.has(notificacao.id)
      idsConhecidosRef.current.add(notificacao.id)

      setNotificacoes((prev) => {
        if (conhecida) {
          return prev.map((n) => (n.id === notificacao.id ? notificacao : n))
        }
        return [notificacao, ...prev]
      })

      if (!conhecida) {
        setNovaNotificacao({ ...notificacao, receivedAt: Date.now() })
      }
    })

    socketRef.current = socket
  }

  // Invalida a conexão atual e fecha o socket, se aberto.
  function desconectar() {
    conexaoIdRef.current++
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  /**
   * Marca uma notificação como lida na API e atualiza o estado local.
   * @param {string} id Id da notificação.
   * @returns {Promise<void>}
   */
  async function marcarLida(id) {
    const res = await marcarNotificacaoLida(id)
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? res.data : n)))
  }

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length

  return (
    <NotificacoesContext.Provider value={{ notificacoes, naoLidasCount, novaNotificacao, marcarLida }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

/**
 * Hook de acesso ao contexto de notificações.
 * @returns {{notificacoes: object[], naoLidasCount: number, novaNotificacao: object|null, marcarLida: (id: string) => Promise<void>}} Estado e ações de notificações.
 */
export function useNotificacoes() {
  return useContext(NotificacoesContext)
}
