import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import Bill from '../models/Bill.js'
import Visit from '../models/Visit.js'
import Hospital from '../models/Hospital.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../utils/razorpay.js'
import { generateInvoicePDF } from '../utils/invoice.js'

function canAccess(user, bill) {
  return user?.role === 'admin' || String(bill.patient) === String(user?.id)
}

export async function createBill(req, res) {
  const patient = req.user.role === 'admin' ? (req.body.patientId || req.user.id) : req.user.id
  const { visitId, hospitalId, items, insurance } = req.body
  const bill = await Bill.create({ patient, visit: visitId || undefined, hospital: hospitalId || undefined, items: items || [], insurance: insurance || { type: 'none', coveragePercent: 0 } })
  bill.recalculate()
  await bill.save()
  res.json({ bill })
}

export async function addItem(req, res) {
  const { id } = req.params
  const { description, amount, code } = req.body
  const bill = await Bill.findById(id)
  if (!bill) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, bill)) return res.status(403).json({ message: 'Forbidden' })
  bill.items.push({ description, amount, code })
  bill.recalculate()
  await bill.save()
  res.json({ bill })
}

export async function setInsurance(req, res) {
  const { id } = req.params
  const { type, coveragePercent, policyNumber, notes } = req.body
  const bill = await Bill.findById(id)
  if (!bill) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, bill)) return res.status(403).json({ message: 'Forbidden' })
  bill.insurance = {
    type: type || 'none',
    coveragePercent: coveragePercent != null ? coveragePercent : (type === 'ayushman' ? 100 : 0),
    policyNumber,
    notes
  }
  bill.recalculate()
  await bill.save()
  res.json({ bill })
}

export async function myBills(req, res) {
  const patientId = req.user.role === 'admin' ? (req.query.patientId || req.user.id) : req.user.id
  const bills = await Bill.find({ patient: patientId }).sort({ createdAt: -1 }).lean()
  res.json({ bills })
}

export async function preparePayment(req, res) {
  const { id } = req.params
  const bill = await Bill.findById(id)
  if (!bill) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, bill)) return res.status(403).json({ message: 'Forbidden' })
  if (bill.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' })
  const receipt = `rcpt_${bill._id.toString()}_${Date.now()}`
  const amountPaise = Math.round(Number(bill.totalPayable) * 100)
  const order = await createRazorpayOrder({ amount: amountPaise, currency: bill.currency || 'INR', receipt, notes: { billId: bill._id.toString() } })
  bill.razorpayOrderId = order.id
  await bill.save()
  res.json({ order, bill: { id: bill._id, amount: bill.totalPayable, currency: bill.currency } })
}

export async function confirmPayment(req, res) {
  const { id } = req.params
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  const bill = await Bill.findById(id)
  if (!bill) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, bill)) return res.status(403).json({ message: 'Forbidden' })
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment fields' })
  }
  const ok = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  bill.paymentStatus = ok ? 'paid' : 'failed'
  bill.razorpayPaymentId = razorpay_payment_id
  await bill.save()
  res.json({ bill, verified: ok })
}

export async function downloadInvoice(req, res) {
  const { id } = req.params
  const bill = await Bill.findById(id).populate('hospital', 'name').populate('patient', 'name email phone').lean()
  if (!bill) return res.status(404).json({ message: 'Not found' })
  if (!canAccess(req.user, bill)) return res.status(403).json({ message: 'Forbidden' })
  const pdf = generateInvoicePDF(bill)
  const filename = `Invoice_${bill._id}.pdf`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.end(pdf)
}
