import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { upload } from '../utils/upload.js'
import { createVisit, myVisits, uploadReport, uploadPrescription, downloadPrescription, downloadReport } from '../controllers/historyController.js'

const router = Router()
router.use(requireAuth)

router.post('/visits', createVisit)
router.get('/visits', myVisits)
router.post('/visits/:id/reports', (req, _res, next) => { req.uploadType = 'reports'; next() }, upload.single('file'), uploadReport)
router.post('/visits/:id/prescription', (req, _res, next) => { req.uploadType = 'prescriptions'; next() }, upload.single('file'), uploadPrescription)
router.get('/visits/:id/prescription', downloadPrescription)
router.get('/visits/:id/reports/:rid', downloadReport)

export default router
