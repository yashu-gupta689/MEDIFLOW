import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  specialties: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('Doctor', doctorSchema)
