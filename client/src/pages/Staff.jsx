import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../services/api'

function StaffInner() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [hospitalId, setHospitalId] = useState('')
  const [counterType, setCounterType] = useState('opd')
  const [lastCalled, setLastCalled] = useState(null)
  const [assigned, setAssigned] = useState(null)

  useEffect(() => {
    if (!socket || !hospitalId) return
    socket.emit('join-hospital', hospitalId)
    return () => {
      socket.emit('leave-hospital', hospitalId)
    }
  }, [socket, hospitalId])

  useEffect(() => {
    const loadAssigned = async () => {
      const { data } = await api.get('/staff/me')
      if (data.counter) {
        setAssigned(data.counter)
        setHospitalId(data.counter.hospital?._id || data.counter.hospital)
        setCounterType(data.counter.type)
      }
    }
    loadAssigned()
  }, [])

  const callNext = async () => {
    const { data } = await api.post('/queue/call-next', { hospitalId, counterType })
    setLastCalled(data.called || null)
  }

  const completeById = async (ticketId) => {
    await api.post('/queue/complete', { ticketId })
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-2">Staff Panel</h1>
      <p className="text-gray-600 mb-4">Hello {user?.name}. Manage token calls and completion.</p>
      {assigned && (
        <div className="mb-4 text-sm text-gray-700">Assigned Counter: {assigned.label} • {assigned.type} at {assigned.hospital?.name}</div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Hospital ID</span>
            <input value={hospitalId} onChange={e => setHospitalId(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Counter</span>
            <select value={counterType} onChange={e => setCounterType(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
              <option value="opd">OPD Counter</option>
              <option value="billing">Billing Counter</option>
              <option value="ayushman">Ayushman Card Counter</option>
              <option value="surgery">Surgery Consultation Counter</option>
              <option value="emergency">Emergency Counter</option>
            </select>
          </label>
          <button className="btn" onClick={callNext}>Call Next</button>
          {lastCalled && (
            <div className="text-sm text-gray-700">Called token {lastCalled.tokenNumber} (position {lastCalled.position})</div>
          )}
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Complete Ticket ID</span>
            <input id="completeId" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <button className="btn" onClick={() => completeById(document.getElementById('completeId').value)}>Mark Completed</button>
        </div>
      </div>
    </div>
  )
}

export default function Staff() {
  return (
    <ProtectedRoute roles={['staff','admin']}>
      <StaffInner />
    </ProtectedRoute>
  )
}
