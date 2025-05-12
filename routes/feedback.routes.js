import express from "express";
import FeedbackController from "../controllers/feedback.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo feedback mới (yêu cầu đăng nhập)
router.post("/create", authMiddleware, FeedbackController.createFeedback);

// Lấy feedback theo carId
router.get("/car/:carId", FeedbackController.getFeedbacksByCar);

export default router;
