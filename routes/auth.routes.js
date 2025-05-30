import express from 'express';
import UserController from '../controllers/user.controller.js';
import authUser from '../middleware/auth.middleware.js';

const router = express.Router();

// Đăng ký
router.post('/user/register', UserController.createUser);

// Đăng nhập
router.post('/user/login', UserController.login);

// Lấy profile user (cần auth)
router.get('/user/get-profile', authUser, UserController.getProfile);

// Quên mật khẩu
router.post('/send-code-forgot-password', UserController.sendResetPasswordEmail);
router.post('/verify-code-and-reset-password', UserController.verifyCodeAndResetPassword);

// Đổi mật khẩu
router.post('/change-password', authUser, UserController.changePassword);

// Xác thực tài khoản
router.post('/verify-email', UserController.verifyEmail);

// Recent viewed cars
router.post('/add-recent-car', authUser, UserController.addRecentViewedCar)
router.get('/recent-cars', authUser, UserController.getRecentViewedCars);

// Trả xe
router.post("/return-car", authUser, UserController.returnCar);

// Lấy danh sách xe đã thuê
router.get("/rented-cars", authUser, UserController.getUserRentedCars);

// Danh sách xe đã thích
router.get('/liked-cars', authUser, UserController.getLikedCars);

// Danh sách user
router.post('/user_list', authUser, UserController.getUserList);

router.post("/update", authUser, UserController.updateUser);

router.post("/delete", authUser, UserController.deleteUser);

export default router;
