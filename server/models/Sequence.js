import mongoose from 'mongoose'

const sequenceSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  counterType: { type: String, required: true },
  dateKey: { type: String, required: true },
  lastSeq: { type: Number, default: 0 }
}, { timestamps: true })

sequenceSchema.index({ hospital: 1, counterType: 1, dateKey: 1 }, { unique: true })

export default mongoose.model('Sequence', sequenceSchema)
