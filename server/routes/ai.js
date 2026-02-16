import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getPeakHours, getAverageWait, getRecommendation, getOvercrowding, getFlow } from '../controllers/aiController.js'

const router = Router()

router.get('/recommend-counter', requireAuth, getRecommendation)
router.get('/average-wait', requireAuth, getAverageWait)

router.use(requireAuth, requireRole('admin'))
router.get('/peak-hours', getPeakHours)
router.get('/overcrowding', getOvercrowding)
router.get('/flow', getFlow)

export default router
