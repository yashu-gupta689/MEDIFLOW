import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  phone: { type: String },
}, { timestamps: true })

hospitalSchema.index({ location: '2dsphere' })

export default mongoose.model('Hospital', hospitalSchema)
