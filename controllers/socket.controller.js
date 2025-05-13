import Message from '../models/message.model.js'; // Import model Message

// Hàm gửi tin nhắn từ khách hàng tới toàn bộ admin
const sendMessageToAdmins = async (socket, io, msg) => {
    console.log('Customer message:', msg);
    const messageData = {
        fromUser: socket.id,  // socket.id của khách hàng
        toUser: 'admin',      // Gửi cho admin
        message: msg,
    };

    // Lưu tin nhắn vào cơ sở dữ liệu MongoDB
    await saveMessageToDB(messageData);

    // Gửi tin nhắn tới tất cả admin
    io.sockets.clients('admin').forEach(adminSocketId => {
        io.to(adminSocketId).emit('chat message', {
            user: 'Customer',
            message: msg,
            fromCustomer: socket.id,
        });
    });
};

// Hàm gửi tin nhắn từ admin đến khách hàng
const sendMessageToCustomer = async (socket, io, msg, customerSocketId) => {
    console.log('Admin message to customer:', msg);
    const messageData = {
        fromUser: socket.id,  // socket.id của admin
        toUser: customerSocketId,  // socket.id của khách hàng
        message: msg,
    };

    // Lưu tin nhắn vào cơ sở dữ liệu MongoDB
    await saveMessageToDB(messageData);

    // Gửi tin nhắn tới khách hàng
    if (customers[customerSocketId]) {
        io.to(customerSocketId).emit('chat message', {
            user: 'Admin',
            message: msg,
        });
    } else {
        console.log('Customer not found');
    }
};

// Hàm lưu tin nhắn vào cơ sở dữ liệu MongoDB
const saveMessageToDB = async (messageData) => {
    try {
        const newMessage = new Message(messageData);
        await newMessage.save();  // Lưu tin nhắn vào DB
        console.log('Message saved to DB:', messageData);
    } catch (error) {
        console.error('Error saving message to DB:', error);
    }
};

export {sendMessageToAdmins, sendMessageToCustomer};
