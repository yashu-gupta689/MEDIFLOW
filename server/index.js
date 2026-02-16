import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/auth.js'
import queueRoutes from './routes/queue.js'
import adminRoutes from './routes/admin.js'
import staffRoutes from './routes/staff.js'
import historyRoutes from './routes/history.js'
import billingRoutes from './routes/billing.js'
import aiRoutes from './routes/ai.js'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { setIO } from './realtime/io.js'
import { overcrowdingStatus } from './utils/ai.js'
import { getIO } from './realtime/io.js'
import Hospital from './models/Hospital.js'

dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

app.get('/api/health', (_, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/queue', queueRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/ai', aiRoutes)

const PORT = process.env.PORT || 5000
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] }
})
setIO(io)
io.on('connection', (socket) => {
  socket.on('join-hospital', (hospitalId) => {
    socket.join(`hospital:${hospitalId}`)
  })
  socket.on('leave-hospital', (hospitalId) => {
    socket.leave(`hospital:${hospitalId}`)
  })
})

setInterval(async () => {
  try {
    const hospitals = await Hospital.find({}, '_id').lean()
    for (const h of hospitals) {
      const status = await overcrowdingStatus({ hospitalId: h._id })
      for (const alert of status.alerts) {
        const ioInst = getIO()
        ioInst?.to(`hospital:${String(h._id)}`).emit('alert:overcrowding', alert)
      }
    }
  } catch {}
}, 30000)

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('DB connection error', err)
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
