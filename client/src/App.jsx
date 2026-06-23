import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import MinhasPublicacoes from './pages/MinhasPublicacoes'
import Propostas from './pages/Propostas'
import PublicacaoDetalhe from './pages/PublicacaoDetalhe'
import Register from './pages/Register'

export default function App() {
  return (
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
    </div>
  )
}
