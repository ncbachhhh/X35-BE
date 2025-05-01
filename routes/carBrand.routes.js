import express from 'express';
import CarBrandController from '../controllers/car_brand.controller.js';

const router = express.Router();

// Tạo hãng xe
router.post('/create', CarBrandController.createCarBrand);

// Lấy danh sách hãng xe
router.get('/list', CarBrandController.getCarBrand);

export default router;
