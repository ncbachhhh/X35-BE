import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import authUser from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/create-payment', authUser, paymentController.createVNPayUrl);
router.get('/vnpay_return', paymentController.handleVNPayReturn)
export default router;