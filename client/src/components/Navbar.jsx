import { NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getUser, isLoggedIn } from '../auth'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const user = getUser()

  function handleLogout() {
    clearToken()
    navigate('/')
  }

  const active = 'underline font-semibold'
  const link = 'hover:underline'

  return (
    <nav className="bg-indigo-600 text-white shadow">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <NavLink to="/" className="font-bold text-lg tracking-tight">
          Trocas
        </NavLink>
        <div className="flex items-center gap-5 text-sm">
          <NavLink to="/" end className={({ isActive }) => isActive ? active : link}>
            Home
          </NavLink>
          {loggedIn ? (
            <>
              <NavLink to="/minhas" className={({ isActive }) => isActive ? active : link}>
                Minhas Publicações
              </NavLink>
              <NavLink to="/propostas" className={({ isActive }) => isActive ? active : link}>
                Propostas
              </NavLink>
              <NotificationBell />
              <span className="opacity-80 hidden sm:inline">{user?.name}</span>
              <button onClick={handleLogout} className="hover:underline cursor-pointer">
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? active : link}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? active : link}>
                Cadastrar
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
