import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  position: { type: Number, required: true },
  etaMinutes: { type: Number, default: 15 },
  counterType: { type: String, enum: ['opd', 'billing', 'ayushman', 'surgery', 'emergency'] },
  tokenNumber: { type: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true })

export default mongoose.model('Ticket', ticketSchema)
