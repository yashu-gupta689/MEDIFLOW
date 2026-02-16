import Ticket from '../models/Ticket.js'
import Counter from '../models/Counter.js'
import Hospital from '../models/Hospital.js'
import { COUNTERS } from './counters.js'

function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export async function peakHours({ hospitalId, days = 30 }) {
  const match = { createdAt: { $gte: daysAgo(days) } }
  if (hospitalId) match.hospital = typeof hospitalId === 'string' ? (await Hospital.findById(hospitalId))?._id || hospitalId : hospitalId
  const data = await Ticket.aggregate([
    { $match: match },
    { $group: { _id: { hour: { $hour: '$createdAt' }, hospital: '$hospital' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 24 }
  ])
  return data.map(d => ({ hospitalId: String(d._id.hospital || ''), hour: d._id.hour, count: d.count }))
}

export async function averageWaitTime({ hospitalId, counterType, days = 7 }) {
  const matchCompleted = { status: 'completed', updatedAt: { $gte: daysAgo(days) } }
  if (hospitalId) matchCompleted.hospital = hospitalId
  if (counterType) matchCompleted.counterType = counterType
  const samples = await Ticket.aggregate([
    { $match: matchCompleted },
    { $project: { waitMinutes: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 60000] } } },
    { $group: { _id: null, avg: { $avg: '$waitMinutes' }, count: { $sum: 1 } } }
  ])
  const sampleAvg = samples[0]?.avg || null
  const count = samples[0]?.count || 0
  if (sampleAvg && count >= 3) return { avgMinutes: Math.round(sampleAvg), source: 'historical', count }
  const types = counterType ? [counterType] : Object.keys(COUNTERS)
  const result = {}
  for (const t of types) {
    const cfg = await Counter.findOne({ hospital: hospitalId, type: t })
    const ahead = await Ticket.countDocuments({ hospital: hospitalId, status: 'active', counterType: t })
    const avgService = cfg?.avgServiceTime != null ? cfg.avgServiceTime : (COUNTERS[t]?.avgServiceTime || 5)
    result[t] = Math.max(0, avgService * ahead)
  }
  if (counterType) return { avgMinutes: result[counterType], source: 'rule', count }
  return { byCounter: result, source: 'rule', count }
}

export async function recommendCounter({ hospitalId }) {
  const types = Object.keys(COUNTERS)
  const estimates = []
  for (const t of types) {
    const cfg = await Counter.findOne({ hospital: hospitalId, type: t })
    const ahead = await Ticket.countDocuments({ hospital: hospitalId, status: 'active', counterType: t })
    const avgService = cfg?.avgServiceTime != null ? cfg.avgServiceTime : (COUNTERS[t]?.avgServiceTime || 5)
    const expectedWait = avgService * ahead
    estimates.push({ counterType: t, label: cfg?.label || COUNTERS[t].label, ahead, avgService, expectedWait })
  }
  estimates.sort((a, b) => a.expectedWait - b.expectedWait)
  return { recommended: estimates[0], estimates }
}

export async function overcrowdingStatus({ hospitalId }) {
  const match = hospitalId ? { hospital: hospitalId, status: 'active' } : { status: 'active' }
  const perCounter = await Ticket.aggregate([
    { $match: match },
    { $group: { _id: { hospital: '$hospital', counterType: '$counterType' }, count: { $sum: 1 } } }
  ])
  const totals = {}
  for (const row of perCounter) {
    const hid = String(row._id.hospital)
    totals[hid] = (totals[hid] || 0) + row.count
  }
  const alerts = []
  for (const row of perCounter) {
    if (row.count > 30) {
      alerts.push({ hospitalId: String(row._id.hospital), type: 'counter', counterType: row._id.counterType, count: row.count })
    }
  }
  for (const [hid, total] of Object.entries(totals)) {
    if (total > 50) alerts.push({ hospitalId: hid, type: 'hospital', total })
  }
  return { alerts, perCounter, totals }
}

export async function patientFlow({ hospitalId, days = 14 }) {
  const since = daysAgo(days)
  const created = await Ticket.aggregate([
    { $match: { ...(hospitalId ? { hospital: hospitalId } : {}), createdAt: { $gte: since } } },
    { $group: { _id: { day: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } }, hospital: '$hospital' }, count: { $sum: 1 } } },
    { $sort: { '_id.day': 1 } }
  ])
  const completed = await Ticket.aggregate([
    { $match: { status: 'completed', ...(hospitalId ? { hospital: hospitalId } : {}), updatedAt: { $gte: since } } },
    { $group: { _id: { day: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%d' } }, hospital: '$hospital' }, count: { $sum: 1 } } },
    { $sort: { '_id.day': 1 } }
  ])
  return { created, completed }
}
