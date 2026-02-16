import Ticket from '../models/Ticket.js'
import Hospital from '../models/Hospital.js'
import { sendSMS } from '../utils/twilio.js'
import Sequence from '../models/Sequence.js'
import { getCounter } from '../utils/counters.js'
import { scheduleSMS } from '../utils/scheduler.js'
import { getIO } from '../realtime/io.js'
import Counter from '../models/Counter.js'

export async function nearbyHospitals(req, res) {
  try {
    const { lat, lng, maxDistance, q } = req.query
    if (!lat || !lng) return res.status(400).json({ message: 'lat,lng required' })
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          spherical: true,
          distanceField: 'distance',
          maxDistance: maxDistance ? parseFloat(maxDistance) : 5000
        }
      },
      ...(q ? [{ $match: { name: { $regex: q, $options: 'i' } } }] : []),
      {
        $lookup: {
          from: 'tickets',
          let: { hospitalId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$hospital', '$$hospitalId'] }, { $eq: ['$status', 'active'] } ] } } }
          ],
          as: 'tickets'
        }
      },
      { $addFields: { queueLength: { $size: '$tickets' } } },
      { $project: { tickets: 0 } },
      { $limit: 20 }
    ]
    const hospitals = await Hospital.aggregate(pipeline)
    res.json({ hospitals })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function joinQueue(req, res) {
  try {
    const userId = req.user?.id
    const { hospitalId } = req.body
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    if (!hospitalId) return res.status(400).json({ message: 'hospitalId required' })
    const count = await Ticket.countDocuments({ hospital: hospitalId, status: 'active' })
    const position = count + 1
    const ticket = await Ticket.create({ user: userId, hospital: hospitalId, position, etaMinutes: Math.max(5, position * 5) })
    const hospital = await Hospital.findById(hospitalId)
    await sendSMS(req.user.phone, `You are #${position} in queue at ${hospital?.name || 'Hospital'}.`)
    res.json({ ticket: { _id: ticket._id, position: ticket.position, eta: ticket.etaMinutes, hospitalName: hospital?.name || 'Hospital', createdAt: ticket.createdAt } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function joinCounter(req, res) {
  try {
    const userId = req.user?.id
    const { hospitalId, counterType } = req.body
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    if (!hospitalId || !counterType) return res.status(400).json({ message: 'hospitalId and counterType required' })
    const counterConst = getCounter(counterType)
    if (!counterConst) return res.status(400).json({ message: 'Invalid counterType' })
    const counterCfg = await Counter.findOne({ hospital: hospitalId, type: counterType })
    const ahead = await Ticket.countDocuments({ hospital: hospitalId, status: 'active', counterType })
    const position = ahead + 1
    const dateKey = new Date().toISOString().slice(0,10).replace(/-/g,'')
    const seqDoc = await Sequence.findOneAndUpdate(
      { hospital: hospitalId, counterType, dateKey },
      { $inc: { lastSeq: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    const seq = seqDoc.lastSeq
    const tokenNumber = `${counterConst.prefix}-${dateKey}-${String(seq).padStart(3,'0')}`
    const avgService = counterCfg?.avgServiceTime != null ? counterCfg.avgServiceTime : counterConst.avgServiceTime
    const etaMinutes = avgService * ahead
    const ticket = await Ticket.create({ user: userId, hospital: hospitalId, position, etaMinutes, counterType, tokenNumber })
    const hospital = await Hospital.findById(hospitalId)
    const name = req.user.name || 'User'
    const hospitalName = hospital?.name || 'Hospital'
    const label = counterCfg?.label || counterConst.label
    const approachingMsg = `Hello ${name}, your token ${tokenNumber} for ${label} at ${hospitalName} is approaching. Please arrive within 10 minutes.`
    const immediateMsg = `Hello ${name}, token ${tokenNumber} for ${label} at ${hospitalName} created. Position ${position}. Estimated wait ${etaMinutes} minutes.`
    await sendSMS(req.user.phone, immediateMsg)
    const delayMs = Math.max(etaMinutes * 60000 - 10 * 60000, 0)
    scheduleSMS(req.user.phone, approachingMsg, delayMs)
    const io = getIO()
    io?.to(`hospital:${hospitalId}`).emit('queue:update', { hospitalId, counterType })
    res.json({
      ticket: {
        _id: ticket._id,
        tokenNumber,
        counterName: label,
        position,
        eta: etaMinutes,
        hospitalName: hospital?.name || 'Hospital',
        createdAt: ticket.createdAt
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
export async function myTickets(req, res) {
  try {
    const userId = req.user?.id
    const tickets = await Ticket.find({ user: userId, status: 'active' }).populate('hospital', 'name')
    res.json({
      tickets: tickets.map(t => ({
        _id: t._id,
        position: t.position,
        eta: t.etaMinutes,
        tokenNumber: t.tokenNumber,
        counterName: getCounter(t.counterType)?.label || t.counterType,
        hospitalName: t.hospital?.name || 'Hospital',
        createdAt: t.createdAt
      }))
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function callNext(req, res) {
  try {
    const { hospitalId, counterType } = req.body
    if (!hospitalId || !counterType) return res.status(400).json({ message: 'hospitalId and counterType required' })
    const next = await Ticket.findOne({ hospital: hospitalId, counterType, status: 'active' }).sort({ position: 1 }).populate('hospital', 'name')
    if (!next) return res.status(404).json({ message: 'No active tickets' })
    const io = getIO()
    io?.to(`hospital:${hospitalId}`).emit('token:called', {
      hospitalId,
      counterType,
      tokenNumber: next.tokenNumber,
      position: next.position,
      hospitalName: next.hospital?.name || 'Hospital'
    })
    res.json({ called: { tokenNumber: next.tokenNumber, position: next.position } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function completeTicket(req, res) {
  try {
    const { ticketId } = req.body
    const ticket = await Ticket.findById(ticketId)
    if (!ticket || ticket.status !== 'active') return res.status(404).json({ message: 'Ticket not found' })
    ticket.status = 'completed'
    await ticket.save()
    await Ticket.updateMany(
      { hospital: ticket.hospital, counterType: ticket.counterType, status: 'active', position: { $gt: ticket.position } },
      { $inc: { position: -1 } }
    )
    const io = getIO()
    io?.to(`hospital:${ticket.hospital}`).emit('queue:update', { hospitalId: String(ticket.hospital), counterType: ticket.counterType })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
