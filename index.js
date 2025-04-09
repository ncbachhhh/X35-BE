import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import * as http from "node:http";
import {Server} from "socket.io";
import db from "./database/db.js";

import UserController from "./controllers/user.controller.js";
import authUser from "./middleware/auth.middleware.js";

// config dotenv
dotenv.config();

// create server
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

// connect to mongodb
db.connect();

// middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());

// socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the server',
    });
})

// Đăng ký
app.post('/auth/user/register', UserController.createUser);
// Đăng nhập
app.post ('/auth/user/login', UserController.login);
app.get("/auth/user/get-profile", authUser, UserController.getProfile);

// Xác thực tài khoản
// - Bước 1
app.post("/auth/verify-email",UserController.verifyEmail);

// start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});