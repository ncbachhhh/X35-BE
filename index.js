import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import * as http from "node:http";
import {Server} from "socket.io";
import db from "./database/db.js";
import authRoutes from './routes/auth.routes.js';
import carTypeRoutes from './routes/carType.routes.js';
import carBrandRoutes from './routes/carBrand.routes.js';
import carGearboxRoutes from './routes/carGearbox.routes.js';
import carRoutes from './routes/car.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import feedbackRoutes from "./routes/feedback.routes.js";

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
app.use('/api/auth', authRoutes);
app.use('/api/car-type', carTypeRoutes);
app.use('/api/car-brand', carBrandRoutes);
app.use('/api/car-gearbox', carGearboxRoutes);
app.use('/api/car', carRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// ================================ START SERVER ================================
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});