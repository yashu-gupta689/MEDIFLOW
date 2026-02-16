import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <header className="glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-primary">
          Smart Hospital Queue
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary' : ''}>Home</NavLink>
          <NavLink to="/map" className={({ isActive }) => isActive ? 'text-primary' : ''}>Map</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-primary' : ''}>Dashboard</NavLink>
              {(user.role === 'staff' || user.role === 'admin') && (
                <NavLink to="/staff" className={({ isActive }) => isActive ? 'text-primary' : ''}>Staff</NavLink>
              )}
              {user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-primary' : ''}>Admin</NavLink>
              )}
              <NavLink to="/display" className={({ isActive }) => isActive ? 'text-primary' : ''}>Display</NavLink>
              <motion.button className="btn" whileTap={{ scale: 0.95 }} onClick={logout}>Logout</motion.button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'text-primary' : ''}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'text-primary' : ''}>Register</NavLink>
            </>
          )}
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </motion.button>
        </nav>
      </div>
    </header>
  )
}
