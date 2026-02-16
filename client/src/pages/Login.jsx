import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 rounded-2xl border border-white/30 bg-white/20 backdrop-blur shadow-lg"
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-secondary/20 rounded-full blur-xl" />
        <h1 className="text-2xl font-semibold mb-6 text-primary">Welcome back</h1>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md px-4 py-2 bg-white/60 border border-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              type="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Password</span>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md px-4 py-2 bg-white/60 border border-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              type="password"
              required
            />
          </label>
          <motion.button whileTap={{ scale: 0.98 }} className="btn w-full bg-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
