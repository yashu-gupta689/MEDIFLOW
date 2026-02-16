import { Router } from 'express'
import { nearbyHospitals, joinQueue, joinCounter, myTickets, callNext, completeTicket } from '../controllers/queueController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.get('/nearby', nearbyHospitals)
router.post('/join', requireAuth, joinQueue)
router.post('/join-counter', requireAuth, joinCounter)
router.get('/my', requireAuth, myTickets)
router.post('/call-next', requireAuth, requireRole('staff','admin'), callNext)
router.post('/complete', requireAuth, requireRole('staff','admin'), completeTicket)

export default router
