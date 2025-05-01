import express from 'express';
import {createVNPayUrl} from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-payment', createVNPayUrl);

export default router;