import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import * as http from "node:http";
import {Server} from "socket.io";
import db from "./database/db.js";
import upload from "./configs/cloudinary.config.js";

import UserController from "./controllers/user.controller.js";
import authUser from "./middleware/auth.middleware.js";
import CarTypeController from "./controllers/car_type.controller.js";
import CarBrandController from "./controllers/car_brand.controller.js";
import CarGearboxController from "./controllers/car_gearbox.controller.js";
import CarController from "./controllers/car.controller.js";

// =================== CONFIG ENVIRONMENT ===============================
dotenv.config();

// =================== CONFIG SERVER ===============================
const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// ================= DATABASE ===============================
db.connect();

// ================================ MIDDLEWARE ================================
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());

// ================================ SOCKET.IO ================================
// socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// ================================ ROUTES ================================
// Đăng ký
app.post('/auth/user/register', UserController.createUser);
// Đăng nhập
app.post('/auth/user/login', UserController.login);
app.get("/auth/user/get-profile", authUser, UserController.getProfile);

// Quên mật khẩu
app.post("/auth/send-code-forgot-password", UserController.sendResetPasswordEmail);
app.post("/auth/verify-code-and-reset-password", UserController.verifyCodeAndResetPassword);

// Xác thực tài khoản
// - Bước 1
app.post("/auth/verify-email",authUser, UserController.verifyEmail);

// Thêm loại xe
app.post("/create/car_type", CarTypeController.createCarType);
app.get('/get/car_type', CarTypeController.getCarType);

// Thêm hãng xe
app.post("/create/car_brand", CarBrandController.createCarBrand);
app.get("/get/car_brand", CarBrandController.getCarBrand);

// Thêm loại hộp số
app.post("/create/car_gearbox", CarGearboxController.createCarGearbox);
app.get("/get/car_gearbox", CarGearboxController.getCarGearbox);

// Thêm xe mới
app.post("/create/car", upload.array("image", 3), CarController.createNewCar);

// ================================ START SERVER ================================
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});