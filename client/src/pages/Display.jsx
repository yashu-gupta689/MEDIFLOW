import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'

export default function Display() {
  const { socket } = useSocket()
  const [hospitalId, setHospitalId] = useState('')
  const [nowServing, setNowServing] = useState([])

  useEffect(() => {
    if (!socket || !hospitalId) return
    socket.emit('join-hospital', hospitalId)
    const handleUpdate = async () => {
      try {
        const { data } = await api.get('/queue/nearby', { params: { lat: 0, lng: 0, maxDistance: 999999 } })
        // Placeholder; in real we would query a dedicated endpoint for per-counter first positions
      } catch {}
    }
    const handleCalled = (payload) => {
      setNowServing(ns => {
        const filtered = ns.filter(x => !(x.counterType === payload.counterType && x.hospitalId === payload.hospitalId))
        return [...filtered, payload]
      })
    }
    socket.on('queue:update', handleUpdate)
    socket.on('token:called', handleCalled)
    return () => {
      socket.emit('leave-hospital', hospitalId)
      socket.off('queue:update', handleUpdate)
      socket.off('token:called', handleCalled)
    }
  }, [socket, hospitalId])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Now Serving</h1>
      <div className="mb-4">
        <input value={hospitalId} onChange={e => setHospitalId(e.target.value)} className="border rounded px-3 py-2" placeholder="Enter Hospital ID" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {nowServing.map((s, idx) => (
          <div key={idx} className="p-4 border rounded bg-white">
            <div className="text-sm text-gray-600">{s.hospitalName}</div>
            <div className="text-lg font-semibold">{s.tokenNumber}</div>
            <div className="text-sm text-gray-700">{s.counterType}</div>
          </div>
        ))}
        {nowServing.length === 0 && (
          <div className="text-gray-500">Waiting for calls…</div>
        )}
      </div>
    </div>
  )
}
