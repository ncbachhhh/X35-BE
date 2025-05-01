import express from 'express';
import CarTypeController from '../controllers/car_type.controller.js';

const router = express.Router();

// Tạo loại xe
router.post('/create', CarTypeController.createCarType);

// Lấy danh sách loại xe
router.get('/list', CarTypeController.getCarType);

export default router;
