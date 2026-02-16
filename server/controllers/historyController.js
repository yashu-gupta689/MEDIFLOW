import fs from 'fs'
import path from 'path'
import Visit from '../models/Visit.js'

function canAccess(user, visit) {
  return user?.role === 'admin' || String(visit.patient) === String(user?.id)
}

export async function createVisit(req, res) {
  const { hospitalId, doctorId, date, diagnosis, notes } = req.body
  const patient = req.user.role === 'admin' ? (req.body.patientId || req.user.id) : req.user.id
  const visit = await Visit.create({ patient, hospital: hospitalId, doctor: doctorId, date: date || new Date(), diagnosis, notes })
  res.json({ visit })
}

export async function myVisits(req, res) {
  const patientId = req.user.role === 'admin' ? (req.query.patientId || req.user.id) : req.user.id
  const visits = await Visit.find({ patient: patientId }).sort({ date: -1 }).lean()
  res.json({ visits })
}

export async function uploadReport(req, res) {
  const { id } = req.params
  const visit = await Visit.findById(id)
  if (!visit) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, visit)) return res.status(403).json({ message: 'Forbidden' })
  if (!req.file) return res.status(400).json({ message: 'No file' })
  const file = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  }
  visit.reports.push(file)
  await visit.save()
  res.json({ report: file })
}

export async function uploadPrescription(req, res) {
  const { id } = req.params
  const visit = await Visit.findById(id)
  if (!visit) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, visit)) return res.status(403).json({ message: 'Forbidden' })
  if (!req.file) return res.status(400).json({ message: 'No file' })
  visit.prescription = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  }
  await visit.save()
  res.json({ prescription: visit.prescription })
}

export async function downloadPrescription(req, res) {
  const { id } = req.params
  const visit = await Visit.findById(id)
  if (!visit) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, visit)) return res.status(403).json({ message: 'Forbidden' })
  if (!visit.prescription || !visit.prescription.path) return res.status(404).json({ message: 'No prescription' })
  const p = visit.prescription.path
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'File missing' })
  res.setHeader('Content-Type', visit.prescription.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${visit.prescription.originalName || path.basename(p)}"`)
  fs.createReadStream(p).pipe(res)
}

export async function downloadReport(req, res) {
  const { id, rid } = req.params
  const visit = await Visit.findById(id)
  if (!visit) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, visit)) return res.status(403).json({ message: 'Forbidden' })
  const report = visit.reports.find(r => String(r._id) === rid)
  if (!report || !report.path) return res.status(404).json({ message: 'No report' })
  if (!fs.existsSync(report.path)) return res.status(404).json({ message: 'File missing' })
  res.setHeader('Content-Type', report.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${report.originalName || path.basename(report.path)}"`)
  fs.createReadStream(report.path).pipe(res)
}
