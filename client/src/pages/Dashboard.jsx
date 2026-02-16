import { useQueue } from '../context/QueueContext'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { myTickets } = useQueue()
  const { user } = useAuth()
  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-2">Welcome {user?.name || 'Guest'}</h1>
      <p className="text-gray-600 mb-4">Your active tokens</p>
      <div className="space-y-3">
        {myTickets.length === 0 ? (
          <p className="text-gray-500">No active tickets</p>
        ) : myTickets.map(t => (
          <div key={t._id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{t.hospitalName}</div>
              <div className="text-sm text-gray-600">Token: {t.tokenNumber || '—'}</div>
              <div className="text-sm text-gray-600">Counter: {t.counterName || '—'}</div>
              <div className="text-sm text-gray-600">Ahead: {Math.max(0, (t.position || 1) - 1)} • ETA: {t.eta}m</div>
            </div>
            <div className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
