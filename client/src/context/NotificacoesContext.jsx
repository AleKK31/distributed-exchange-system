import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { listarNotificacoes, marcarNotificacaoLida } from '../api'
import { getToken, isLoggedIn } from '../auth'

const NotificacoesContext = createContext(null)

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

  function handleAuthChanged() {
    if (isLoggedIn()) {
      conectar()
    } else {
      desconectar()
      setNotificacoes([])
      idsConhecidosRef.current = new Set()
    }
  }

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

  function desconectar() {
    conexaoIdRef.current++
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

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

export function useNotificacoes() {
  return useContext(NotificacoesContext)
}
