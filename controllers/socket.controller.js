import Message from '../models/message.model.js';

const ADMIN_ID = "68234527e33af47bdda55eca";

// Hàm lưu tin nhắn vào DB
const saveMessageToDB = async ({fromUser, toUser, message}) => {
    try {
        const newMessage = new Message({fromUser, toUser, message});
        await newMessage.save();
    } catch (error) {
        console.error('Error saving message:', error);
    }
};

// Gửi tin nhắn từ user tới tất cả admin đang online
const sendMessageToAdmins = async (io, fromUserId, message, adminSockets) => {
    try {
        // Lưu tin nhắn với adminId cứng
        await saveMessageToDB({fromUser: fromUserId, toUser: ADMIN_ID, message});

        // Tìm socket admin theo ADMIN_ID
        const adminSocketId = adminSockets[ADMIN_ID];
        if (adminSocketId) {
            io.of('/admin').to(adminSocketId).emit('receive_message', {
                fromUser: fromUserId,
                message,
                timestamp: new Date(),
            });
            console.log(`Emit receive_message to adminSocketId: ${adminSocketId}`);
        } else {
            console.log("Admin socket not found, cannot send realtime message");
        }
    } catch (error) {
        console.error('Error in sendMessageToAdmins:', error);
    }
};

// Gửi tin nhắn từ admin tới 1 khách hàng
const sendMessageToCustomer = async (io, fromAdminId, toUserId, message, customerSockets) => {
    try {
        await saveMessageToDB({fromUser: fromAdminId, toUser: toUserId, message});

        const socketIds = customerSockets[toUserId];
        if (socketIds && socketIds.size > 0) {
            socketIds.forEach((socketId) => {
                io.of('/customer').to(socketId).emit('receive_message', {
                    fromUser: fromAdminId,
                    message,
                    timestamp: new Date(),
                });
            });
            console.log(`Emit receive_message to ${socketIds.size} customer sockets for userId ${toUserId}`);
        } else {
            console.log('Customer offline, cannot send message realtime');
        }
    } catch (error) {
        console.error('Error in sendMessageToCustomer:', error);
    }
};


export {saveMessageToDB, sendMessageToAdmins, sendMessageToCustomer};
