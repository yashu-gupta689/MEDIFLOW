import { motion } from 'framer-motion'

export default function Loader({ text = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: 'rgb(var(--primary))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: 'rgb(var(--primary))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: 'rgb(var(--primary))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
      <div className="muted">{text}</div>
    </div>
  )
}
