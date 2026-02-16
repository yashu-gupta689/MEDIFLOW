import Hospital from '../models/Hospital.js'
import Counter from '../models/Counter.js'
import Doctor from '../models/Doctor.js'
import Ticket from '../models/Ticket.js'

export async function listHospitals(req, res) {
  const items = await Hospital.find().lean()
  res.json({ hospitals: items })
}

export async function createHospital(req, res) {
  const { name, lng, lat, phone } = req.body
  if (!name || lat == null || lng == null) return res.status(400).json({ message: 'name, lat, lng required' })
  const hospital = await Hospital.create({ name, phone, location: { type: 'Point', coordinates: [lng, lat] } })
  res.json({ hospital })
}

export async function updateHospital(req, res) {
  const { id, name, lng, lat, phone } = req.body
  const hospital = await Hospital.findById(id)
  if (!hospital) return res.status(404).json({ message: 'Not found' })
  if (name) hospital.name = name
  if (phone) hospital.phone = phone
  if (lat != null && lng != null) hospital.location = { type: 'Point', coordinates: [lng, lat] }
  await hospital.save()
  res.json({ hospital })
}

export async function deleteHospital(req, res) {
  const { id } = req.body
  await Hospital.findByIdAndDelete(id)
  res.json({ ok: true })
}

export async function listCounters(req, res) {
  const { hospitalId } = req.query
  const items = await Counter.find(hospitalId ? { hospital: hospitalId } : {}).populate('assignedDoctor', 'name').populate('assignedStaff', 'name email').lean()
  res.json({ counters: items })
}

export async function createCounter(req, res) {
  const { hospitalId, type, label, avgServiceTime } = req.body
  if (!hospitalId || !type || !label) return res.status(400).json({ message: 'hospitalId,type,label required' })
  const counter = await Counter.create({ hospital: hospitalId, type, label, avgServiceTime: avgServiceTime || 5 })
  res.json({ counter })
}

export async function updateCounter(req, res) {
  const { id, label, avgServiceTime, assignedDoctorId, assignedStaffId, active } = req.body
  const counter = await Counter.findById(id)
  if (!counter) return res.status(404).json({ message: 'Not found' })
  if (label) counter.label = label
  if (avgServiceTime != null) counter.avgServiceTime = avgServiceTime
  if (assignedDoctorId != null) counter.assignedDoctor = assignedDoctorId || undefined
  if (assignedStaffId != null) counter.assignedStaff = assignedStaffId || undefined
  if (active != null) counter.active = !!active
  await counter.save()
  res.json({ counter })
}

export async function deleteCounter(req, res) {
  const { id } = req.body
  await Counter.findByIdAndDelete(id)
  res.json({ ok: true })
}

export async function listDoctors(req, res) {
  const { hospitalId } = req.query
  const items = await Doctor.find(hospitalId ? { hospital: hospitalId } : {}).lean()
  res.json({ doctors: items })
}

export async function createDoctor(req, res) {
  const { hospitalId, name, email, phone, specialties } = req.body
  if (!hospitalId || !name) return res.status(400).json({ message: 'hospitalId,name required' })
  const doctor = await Doctor.create({ hospital: hospitalId, name, email, phone, specialties: specialties || [] })
  res.json({ doctor })
}

export async function updateDoctor(req, res) {
  const { id, name, email, phone, specialties } = req.body
  const doctor = await Doctor.findById(id)
  if (!doctor) return res.status(404).json({ message: 'Not found' })
  if (name) doctor.name = name
  if (email) doctor.email = email
  if (phone) doctor.phone = phone
  if (specialties) doctor.specialties = specialties
  await doctor.save()
  res.json({ doctor })
}

export async function deleteDoctor(req, res) {
  const { id } = req.body
  await Doctor.findByIdAndDelete(id)
  res.json({ ok: true })
}

export async function analytics(req, res) {
  const { hospitalId } = req.query
  const match = hospitalId ? { hospital: hospitalId } : {}
  const byCounter = await Ticket.aggregate([
    { $match: { status: 'active', ...match } },
    { $group: { _id: { hospital: '$hospital', counterType: '$counterType' }, count: { $sum: 1 }, avgETA: { $avg: '$etaMinutes' } } }
  ])
  res.json({ byCounter })
}
