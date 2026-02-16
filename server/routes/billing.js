import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createBill, addItem, setInsurance, myBills, preparePayment, confirmPayment, downloadInvoice } from '../controllers/billingController.js'

const router = Router()
router.use(requireAuth)

router.post('/bills', createBill)
router.get('/bills', myBills)
router.post('/bills/:id/items', addItem)
router.put('/bills/:id/insurance', setInsurance)
router.post('/bills/:id/pay', preparePayment)
router.post('/bills/:id/confirm', confirmPayment)
router.get('/bills/:id/invoice', downloadInvoice)

export default router
