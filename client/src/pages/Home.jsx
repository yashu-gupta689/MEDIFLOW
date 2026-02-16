import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <h1 className="text-2xl font-semibold mb-2">Smart Hospital Queue</h1>
        <p className="text-gray-600 mb-4">
          Find nearby hospitals, join queues remotely, and get SMS alerts when it’s your turn.
        </p>
        <div className="flex gap-3">
          <Link to="/map" className="btn">Find Hospitals</Link>
          <Link to="/register" className="btn bg-secondary hover:bg-emerald-600">Get Started</Link>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
        <h2 className="font-medium mb-2">How it works</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Allow location to discover hospitals near you</li>
          <li>View live queue lengths and estimated wait times</li>
          <li>Join a queue and get updates via SMS</li>
        </ul>
      </motion.div>
    </div>
  )
}
