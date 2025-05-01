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

// Xác thực tài khoản
router.post('/verify-email', UserController.verifyEmail);

export default router;
