import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { myAssignedCounter } from '../controllers/staffController.js'

const router = Router()
router.get('/me', requireAuth, requireRole('staff','admin'), myAssignedCounter)

export default router
