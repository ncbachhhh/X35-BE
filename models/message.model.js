import mongoose from 'mongoose';

// Định nghĩa schema tin nhắn
const messageSchema = new mongoose.Schema(
    {
        fromUser: {
            type: String,  // ID của người gửi (có thể là socket.id của admin hoặc khách hàng)
            required: true
        },
        toUser: {
            type: String,  // ID của người nhận (có thể là socket.id của admin hoặc khách hàng)
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {timestamps: true} // Thêm trường createdAt và updatedAt
);

// Tạo model Message từ schema
const Message = mongoose.model('Message', messageSchema);

export default Message;
