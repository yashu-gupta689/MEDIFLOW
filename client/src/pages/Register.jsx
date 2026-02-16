import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  const submit = (e) => {
    e.preventDefault()
    register({ name, email, phone, password, role })
  }

  return (
    <motion.form onSubmit={submit} className="card max-w-md mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <label className="block mb-3">
        <span className="text-sm text-gray-600">Name</span>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </label>
      <label className="block mb-3">
        <span className="text-sm text-gray-600">Email</span>
        <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="email" required />
      </label>
      <label className="block mb-3">
        <span className="text-sm text-gray-600">Phone</span>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="tel" required />
      </label>
      <label className="block mb-3">
        <span className="text-sm text-gray-600">Role</span>
        <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          <option value="user">User</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="block mb-4">
        <span className="text-sm text-gray-600">Password</span>
        <input value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="password" required />
      </label>
      <button className="btn w-full" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
    </motion.form>
  )
}
