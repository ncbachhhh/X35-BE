import Message from "../models/message.model.js";
import {saveMessageToDB} from "./socket.controller.js"; // chắc bạn có hàm này để lưu

const MessageController = {
    getChatHistory: async (req, res) => {
        try {
            const {userId} = req.params;

            // Lấy toàn bộ tin nhắn giữa admin (userId='admin' hoặc lấy id admin thực) và user đó (userId)
            const messages = await Message.find({
                $or: [
                    {fromUser: userId, toUser: req.user.id},    // user gửi admin
                    {fromUser: req.user.id, toUser: userId}     // admin gửi user
                ]
            }).sort({createdAt: 1}); // Sắp xếp theo thời gian tăng dần

            return res.status(200).json({
                isSuccess: true,
                data: {messages},
            });
        } catch (error) {
            console.error("Error getting chat history:", error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi khi lấy lịch sử chat",
                error: error.message,
            });
        }
    },

    sendMessageToUser: async (req, res) => {
        try {
            // Lấy admin id từ req.user (bạn phải middleware auth để có req.user)
            const adminUserId = req.user.id;
            const {toUserId, message} = req.body;

            // Lưu tin nhắn vào DB
            await saveMessageToDB({
                fromUser: adminUserId,
                toUser: toUserId,
                message,
            });

            // Nếu bạn có socket io instance, có thể emit ở đây
            // vd: io.to(userIdToSocketIdMap.get(toUserId)).emit('chat message', ...)

            return res.status(200).json({
                isSuccess: true,
                message: "Message sent successfully",
            });
        } catch (error) {
            console.error("Error sending message:", error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi khi gửi tin nhắn",
                error: error.message,
            });
        }
    }
};

export default MessageController;
