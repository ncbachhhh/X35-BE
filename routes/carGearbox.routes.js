import express from 'express';
import CarGearboxController from '../controllers/car_gearbox.controller.js';

const router = express.Router();

// Tạo loại hộp số
router.post('/create', CarGearboxController.createCarGearbox);

// Lấy danh sách hộp số
router.get('/list', CarGearboxController.getCarGearbox);

export default router;
