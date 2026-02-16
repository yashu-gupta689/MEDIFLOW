import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-hospital-queue'
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(uri)
    console.log('MongoDB Connected')
  } catch (err) {
    console.error('DB Connection Error:', err)
    throw err
  }
}
