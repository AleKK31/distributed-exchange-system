import { useEffect, useState } from 'react'
import { useNotificacoes } from '../context/NotificacoesContext'

const tipoConfig = {
  'match.encontrado': 'bg-blue-600',
  'match.aceito': 'bg-green-600',
  'match.recusado': 'bg-red-500',
  'match.expirado': 'bg-yellow-500',
  'match.cancelado': 'bg-red-500',
}

export default function Toast() {
  const { novaNotificacao } = useNotificacoes()
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (!novaNotificacao) return

    const toastId = novaNotificacao.receivedAt
    setToasts((prev) => [
      { id: toastId, mensagem: novaNotificacao.mensagem, tipo: novaNotificacao.tipo },
      ...prev,
    ])

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 4000)

    return () => clearTimeout(timer)
  }, [novaNotificacao])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${tipoConfig[toast.tipo] ?? 'bg-gray-700'} text-white text-sm rounded-lg shadow-lg px-4 py-3`}
        >
          {toast.mensagem}
        </div>
      ))}
    </div>
  )
}
