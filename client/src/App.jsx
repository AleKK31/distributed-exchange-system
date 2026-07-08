/**
 * Componente raiz da aplicação. Define o layout base (navbar + toasts), envolve
 * tudo no provider de notificações e declara as rotas das páginas.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import { NotificacoesProvider } from './context/NotificacoesContext'
import Home from './pages/Home'
import Login from './pages/Login'
import MinhasPublicacoes from './pages/MinhasPublicacoes'
import Propostas from './pages/Propostas'
import PublicacaoDetalhe from './pages/PublicacaoDetalhe'
import Register from './pages/Register'

/**
 * Monta a estrutura da aplicação e o mapeamento de rotas.
 * @returns {JSX.Element} Árvore de componentes da aplicação.
 */
export default function App() {
  return (
    <NotificacoesProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publicacao/:id" element={<PublicacaoDetalhe />} />
            <Route path="/minhas" element={<MinhasPublicacoes />} />
            <Route path="/propostas" element={<Propostas />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </NotificacoesProvider>
  )
}
