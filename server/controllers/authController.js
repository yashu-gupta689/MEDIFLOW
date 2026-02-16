import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function sign(user) {
  return jwt.sign({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' })
}

export async function register(req, res) {
  try {
    const { name, email, phone, password, role } = req.body
    if (!name || !email || !phone || !password) return res.status(400).json({ message: 'Missing fields' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email in use' })
    const passwordHash = await User.hashPassword(password)
    const user = await User.create({ name, email, phone, passwordHash, role: role && ['user','admin','staff'].includes(role) ? role : 'user' })
    const token = sign(user)
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = sign(user)
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
