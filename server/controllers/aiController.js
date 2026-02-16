import { peakHours, averageWaitTime, recommendCounter, overcrowdingStatus, patientFlow } from '../utils/ai.js'

export async function getPeakHours(req, res) {
  const { hospitalId, days } = req.query
  const data = await peakHours({ hospitalId, days: days ? parseInt(days) : 30 })
  res.json({ peakHours: data })
}

export async function getAverageWait(req, res) {
  const { hospitalId, counterType, days } = req.query
  const data = await averageWaitTime({ hospitalId, counterType, days: days ? parseInt(days) : 7 })
  res.json({ averageWait: data })
}

export async function getRecommendation(req, res) {
  const { hospitalId } = req.query
  const data = await recommendCounter({ hospitalId })
  res.json({ recommendation: data })
}

export async function getOvercrowding(req, res) {
  const { hospitalId } = req.query
  const data = await overcrowdingStatus({ hospitalId })
  res.json({ overcrowding: data })
}

export async function getFlow(req, res) {
  const { hospitalId, days } = req.query
  const data = await patientFlow({ hospitalId, days: days ? parseInt(days) : 14 })
  res.json({ flow: data })
}
