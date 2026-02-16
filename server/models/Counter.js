import mongoose from 'mongoose'

const counterSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  type: { type: String, enum: ['opd','billing','ayushman','surgery','emergency'], required: true },
  label: { type: String, required: true },
  avgServiceTime: { type: Number, default: 5 },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true }
}, { timestamps: true })

counterSchema.index({ hospital: 1, type: 1 }, { unique: false })

export default mongoose.model('Counter', counterSchema)
