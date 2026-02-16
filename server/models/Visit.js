import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  mimeType: String,
  size: Number,
  path: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true })

const visitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String },
  notes: { type: String },
  prescription: fileSchema,
  reports: { type: [fileSchema], default: [] }
}, { timestamps: true })

export default mongoose.model('Visit', visitSchema)
