import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const QueueCtx = createContext(null)

export function QueueProvider({ children }) {
  const [myTickets, setMyTickets] = useState([])
  const { token } = useAuth()

  const joinQueue = async (hospital, counterType) => {
    try {
      if (counterType) {
        const { data } = await api.post('/queue/join-counter', { hospitalId: hospital._id || hospital.id, counterType })
        setMyTickets(t => [data.ticket, ...t])
        toast.success(`Token ${data.ticket.tokenNumber} at ${data.ticket.counterName}. Position ${data.ticket.position}`)
      } else {
        const { data } = await api.post('/queue/join', { hospitalId: hospital._id || hospital.id })
        setMyTickets(t => [data.ticket, ...t])
        toast.success(`Joined queue at ${hospital.name}. Position ${data.ticket.position}`)
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to join queue')
    }
  }

  const fetchMyTickets = async () => {
    try {
      const { data } = await api.get('/queue/my')
      setMyTickets(data.tickets || [])
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    if (token) fetchMyTickets()
  }, [token])

  return (
    <QueueCtx.Provider value={{ myTickets, joinQueue, fetchMyTickets }}>
      {children}
    </QueueCtx.Provider>
  )
}

export const useQueue = () => useContext(QueueCtx)
