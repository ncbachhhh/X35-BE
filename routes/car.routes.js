import express from 'express';
import CarController from '../controllers/car.controller.js';
import upload from '../configs/cloudinary.config.js';
import authUser from '../middleware/auth.middleware.js';

const router = express.Router();

// Tạo xe mới (cần login + upload ảnh)
router.post('/create', authUser, upload.array('image', 3), CarController.createNewCar);

// Lấy chi tiết 1 xe
router.get('/detail', CarController.getCarById);

// Lấy danh sách xe
router.post('/list', CarController.getCarListing);

// Like/unlike xe
router.post('/like', CarController.likeCar);

// Lấy các xe được recommend từ các xe đã like
router.post('/recommend-by-liked', authUser, CarController.getRecommendCarsFromLiked);

// Lấy các xe được thuê nhiều
router.get('/popular-cars', CarController.getPopularCar);

export default router;
