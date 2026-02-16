import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { listHospitals, createHospital, updateHospital, deleteHospital, listCounters, createCounter, updateCounter, deleteCounter, listDoctors, createDoctor, updateDoctor, deleteDoctor, analytics } from '../controllers/adminController.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/hospitals', listHospitals)
router.post('/hospitals', createHospital)
router.put('/hospitals', updateHospital)
router.delete('/hospitals', deleteHospital)

router.get('/counters', listCounters)
router.post('/counters', createCounter)
router.put('/counters', updateCounter)
router.delete('/counters', deleteCounter)

router.get('/doctors', listDoctors)
router.post('/doctors', createDoctor)
router.put('/doctors', updateDoctor)
router.delete('/doctors', deleteDoctor)

router.get('/analytics', analytics)

export default router
