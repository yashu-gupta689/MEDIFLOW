import Counter from '../models/Counter.js'

export async function myAssignedCounter(req, res) {
  const staffId = req.user?.id
  const counter = await Counter.findOne({ assignedStaff: staffId }).populate('hospital', 'name').lean()
  if (!counter) return res.json({ counter: null })
  res.json({ counter })
}
