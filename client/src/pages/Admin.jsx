import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import Loader from '../components/Loader'
import api from '../services/api'

function AdminInner() {
  const [hospitals, setHospitals] = useState([])
  const [counters, setCounters] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('')

  const loadHospitals = async () => {
    const { data } = await api.get('/admin/hospitals')
    setHospitals(data.hospitals || [])
  }
  const loadCounters = async () => {
    const { data } = await api.get('/admin/counters', { params: { hospitalId: selectedHospital || undefined } })
    setCounters(data.counters || [])
  }
  const loadDoctors = async () => {
    const { data } = await api.get('/admin/doctors', { params: { hospitalId: selectedHospital || undefined } })
    setDoctors(data.doctors || [])
  }

  useEffect(() => {
    loadHospitals()
  }, [])
  useEffect(() => {
    loadCounters()
    loadDoctors()
    loadAnalytics()
  }, [selectedHospital])

  const addHospital = async (payload) => {
    await api.post('/admin/hospitals', payload)
    loadHospitals()
  }
  const updateHospital = async (payload) => {
    await api.put('/admin/hospitals', payload)
    loadHospitals()
  }
  const deleteHospital = async (id) => {
    await api.delete('/admin/hospitals', { data: { id } })
    loadHospitals()
  }

  const addCounter = async (payload) => {
    await api.post('/admin/counters', payload)
    loadCounters()
  }
  const updateCounter = async (payload) => {
    await api.put('/admin/counters', payload)
    loadCounters()
  }
  const deleteCounter = async (id) => {
    await api.delete('/admin/counters', { data: { id } })
    loadCounters()
  }

  const addDoctor = async (payload) => {
    await api.post('/admin/doctors', payload)
    loadDoctors()
  }
  const updateDoctor = async (payload) => {
    await api.put('/admin/doctors', payload)
    loadDoctors()
  }
  const deleteDoctor = async (id) => {
    await api.delete('/admin/doctors', { data: { id } })
    loadDoctors()
  }

  const [formH, setFormH] = useState({ name: '', lat: '', lng: '', phone: '' })
  const [formC, setFormC] = useState({ type: 'opd', label: '', avgServiceTime: 5 })
  const [formD, setFormD] = useState({ name: '', email: '', phone: '' })
  const [flow, setFlow] = useState({ created: [], completed: [] })
  const [overcrowding, setOvercrowding] = useState({ totals: {}, perCounter: [], alerts: [] })
  const [loadingCharts, setLoadingCharts] = useState(false)

  const loadAnalytics = async () => {
    try {
      setLoadingCharts(true)
      const { data: flowRes } = await api.get('/ai/flow', { params: { hospitalId: selectedHospital || undefined, days: 14 } })
      const { data: crowdRes } = await api.get('/ai/overcrowding', { params: { hospitalId: selectedHospital || undefined } })
      setFlow(flowRes.flow || { created: [], completed: [] })
      setOvercrowding(crowdRes.overcrowding || { totals: {}, perCounter: [], alerts: [] })
    } finally {
      setLoadingCharts(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage hospitals, counters, doctors, and analytics</p>
      </div>
      <div className="card">
        <h2 className="font-medium mb-2">Hospitals</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={formH.name} onChange={e=>setFormH({...formH, name:e.target.value})} />
            <div className="flex gap-2">
              <input className="border rounded px-3 py-2 w-1/2" placeholder="Latitude" value={formH.lat} onChange={e=>setFormH({...formH, lat: e.target.value})} />
              <input className="border rounded px-3 py-2 w-1/2" placeholder="Longitude" value={formH.lng} onChange={e=>setFormH({...formH, lng: e.target.value})} />
            </div>
            <input className="border rounded px-3 py-2 w-full" placeholder="Phone" value={formH.phone} onChange={e=>setFormH({...formH, phone:e.target.value})} />
            <button className="btn" onClick={()=>addHospital({ name: formH.name, lat: parseFloat(formH.lat), lng: parseFloat(formH.lng), phone: formH.phone })}>Add Hospital</button>
          </div>
          <div>
            <select className="border rounded px-3 py-2 mb-2 w-full" value={selectedHospital} onChange={e=>setSelectedHospital(e.target.value)}>
              <option value="">All Hospitals</option>
              {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
            <ul className="divide-y">
              {hospitals.map(h => (
                <li key={h._id} className="py-2 flex justify-between">
                  <div className="text-sm">{h.name}</div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>updateHospital({ id: h._id, name: h.name })}>Edit</button>
                    <button className="btn" onClick={()=>deleteHospital(h._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">Counters</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <select className="border rounded px-3 py-2 w-full" value={formC.type} onChange={e=>setFormC({...formC, type:e.target.value})}>
              <option value="opd">OPD</option>
              <option value="billing">Billing</option>
              <option value="ayushman">Ayushman</option>
              <option value="surgery">Surgery</option>
              <option value="emergency">Emergency</option>
            </select>
            <input className="border rounded px-3 py-2 w-full" placeholder="Label" value={formC.label} onChange={e=>setFormC({...formC, label:e.target.value})} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Avg Service Time (min)" type="number" value={formC.avgServiceTime} onChange={e=>setFormC({...formC, avgServiceTime: parseInt(e.target.value)})} />
            <button className="btn" onClick={()=>addCounter({ hospitalId: selectedHospital, type: formC.type, label: formC.label, avgServiceTime: formC.avgServiceTime })} disabled={!selectedHospital}>Add Counter</button>
          </div>
          <div>
            <ul className="divide-y">
              {counters.map(c => (
                <li key={c._id} className="py-2 flex justify-between">
                  <div className="text-sm">{c.label} • {c.type} • {c.avgServiceTime}m</div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>updateCounter({ id: c._id, avgServiceTime: c.avgServiceTime })}>Save</button>
                    <button className="btn" onClick={()=>deleteCounter(c._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">Doctors</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={formD.name} onChange={e=>setFormD({...formD, name:e.target.value})} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={formD.email} onChange={e=>setFormD({...formD, email:e.target.value})} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Phone" value={formD.phone} onChange={e=>setFormD({...formD, phone:e.target.value})} />
            <button className="btn" onClick={()=>addDoctor({ hospitalId: selectedHospital, name: formD.name, email: formD.email, phone: formD.phone })} disabled={!selectedHospital}>Add Doctor</button>
          </div>
          <div>
            <ul className="divide-y">
              {doctors.map(d => (
                <li key={d._id} className="py-2 flex justify-between">
                  <div className="text-sm">{d.name} • {d.phone || ''}</div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>updateDoctor({ id: d._id, name: d.name })}>Edit</button>
                    <button className="btn" onClick={()=>deleteDoctor(d._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">Analytics</h2>
        {loadingCharts ? (
          <Loader text="Loading charts..." />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="heading-2 mb-2">Patient Flow (14 days)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={mergeFlow(flow)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="heading-2 mb-2">Active by Counter</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieCounters(overcrowding.perCounter)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieCounters(overcrowding.perCounter).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6','#10b981','#f59e0b','#ef4444','#6366f1'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {overcrowding.alerts.length > 0 && (
                <div className="mt-3 text-red-600 text-sm">Alerts: {overcrowding.alerts.length}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminInner />
    </ProtectedRoute>
  )
}

function mergeFlow(flow) {
  const map = new Map()
  for (const row of flow.created || []) {
    const key = row._id?.day || row.day
    map.set(key, { day: key, created: row.count, completed: 0 })
  }
  for (const row of flow.completed || []) {
    const key = row._id?.day || row.day
    const prev = map.get(key) || { day: key, created: 0, completed: 0 }
    prev.completed = row.count
    map.set(key, prev)
  }
  return Array.from(map.values())
}

function pieCounters(perCounter) {
  const grouped = {}
  for (const row of perCounter || []) {
    const name = row._id?.counterType || row.counterType
    grouped[name] = (grouped[name] || 0) + row.count
  }
  return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}
