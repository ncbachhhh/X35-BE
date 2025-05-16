import express from "express";
import MessageController from "../controllers/messsage.controller.js";
import authUser from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/history/:userId", authUser, MessageController.getChatHistory);
router.post("/send", authUser, MessageController.sendMessageToUser);

export default router;