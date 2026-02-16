import { useEffect, useMemo, useState } from 'react'
import Map from '../components/Map'
import { useQueue } from '../context/QueueContext'
import api from '../services/api'
import { motion } from 'framer-motion'

const containerStyle = { width: '100%', height: '400px' }

export default function MapPage() {
  const [position, setPosition] = useState({ lat: 28.6139, lng: 77.2090 })
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [distanceKm, setDistanceKm] = useState(5)
  const { joinQueue } = useQueue()
  const [counterType, setCounterType] = useState('opd')

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition({ lat: latitude, lng: longitude })
          fetchNearby(latitude, longitude, distanceKm, query)
        },
        () => {}
      )
    }
  }, [])

  const fetchNearby = async (lat, lng, km, q) => {
    try {
      setLoading(true)
      const { data } = await api.get('/queue/nearby', { params: { lat, lng, maxDistance: km * 1000, q } })
      const hospitals = (data.hospitals || []).map(h => ({
        id: h._id,
        name: h.name,
        lat: h.location?.coordinates?.[1],
        lng: h.location?.coordinates?.[0],
        distance: h.distance,
        queueLength: h.queueLength || 0
      }))
      setNearby(hospitals)
      setSelected(null)
    } catch (e) {
      setNearby([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (position) {
      fetchNearby(position.lat, position.lng, distanceKm, query)
    }
  }, [distanceKm, query])

  const filtered = useMemo(() => nearby, [nearby])

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold mb-2">Nearby Hospitals</h1>
        <p className="text-gray-600 mb-2">Based on your current location</p>
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name"
            className="w-full md:w-1/2 border rounded px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Distance</span>
            <input type="range" min="1" max="10" value={distanceKm} onChange={e => setDistanceKm(parseInt(e.target.value))} />
            <span className="text-sm">{distanceKm} km</span>
          </div>
        </div>
        <Map />
      </div>
      <div className="card">
        <h2 className="font-medium mb-2">Hospitals</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded animate-pulse">
                <div className="h-4 w-1/2 bg-gray-200 mb-2" />
                <div className="h-3 w-1/3 bg-gray-200 mb-4" />
                <div className="h-8 w-full bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map(h => (
              <motion.div key={h.id} whileHover={{ scale: 1.01 }} className="p-4 border rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{h.name}</div>
                    <div className="text-sm text-gray-600">{(h.distance/1000).toFixed(2)} km away</div>
                    <div className="text-sm text-gray-600">Queue length: {h.queueLength}</div>
                  </div>
                  <button className="btn" onClick={() => setSelected(h)}>View</button>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <select value={counterType} onChange={e => setCounterType(e.target.value)} className="border rounded px-3 py-2">
                    <option value="opd">OPD Counter</option>
                    <option value="billing">Billing Counter</option>
                    <option value="ayushman">Ayushman Card Counter</option>
                    <option value="surgery">Surgery Consultation Counter</option>
                    <option value="emergency">Emergency Counter</option>
                  </select>
                  <button className="btn bg-secondary hover:bg-emerald-600" onClick={() => joinQueue(h, counterType)}>Get Token</button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-500">No hospitals found within {distanceKm} km</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
