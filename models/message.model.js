// message.model.js

import mongoose from 'mongoose';

// Định nghĩa schema tin nhắn
const messageSchema = new mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,  // ID của người gửi (id của admin hoặc khách hàng không phải socket.id)
            required: true,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,  // ID của người nhận (id của admin hoặc khách hàng không phải socket.id)
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {timestamps: true} // Thêm trường createdAt và updatedAt
);

// Tạo model Message từ schema
const Message = mongoose.model('Message', messageSchema);

export default Message;
