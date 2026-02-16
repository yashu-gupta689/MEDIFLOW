import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  code: { type: String }
}, { _id: true })

const insuranceSchema = new mongoose.Schema({
  type: { type: String, enum: ['none', 'ayushman', 'other'], default: 'none' },
  coveragePercent: { type: Number, default: 0 }, // 0-100
  policyNumber: { type: String },
  notes: { type: String }
}, { _id: false })

const billSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  items: { type: [itemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  insurance: { type: insuranceSchema, default: { type: 'none', coveragePercent: 0 } },
  insuranceAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  receiptNumber: { type: String }
}, { timestamps: true })

billSchema.methods.recalculate = function () {
  const subtotal = this.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
  this.subtotal = Math.round(subtotal * 100) / 100
  const coverage = Math.min(100, Math.max(0, this.insurance?.coveragePercent || 0))
  const insuranceAmount = Math.round((this.subtotal * coverage / 100) * 100) / 100
  this.insuranceAmount = insuranceAmount
  this.totalPayable = Math.max(0, Math.round((this.subtotal - insuranceAmount) * 100) / 100)
}

export default mongoose.model('Bill', billSchema)
