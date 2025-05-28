import {Server} from 'socket.io';
import {sendMessageToAdmins, sendMessageToCustomer} from '../controllers/socket.controller.js';

const socketConfig = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    const customerNamespace = io.of('/customer');
    const adminNamespace = io.of('/admin');

    // Map userId -> socketId
    const customerSockets = {};
    const adminSockets = {};

    // Map socketId -> userId
    const socketToUserMap = {};

    // Xử lý khách hàng kết nối
    customerNamespace.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (!userId) return socket.disconnect();

        if (!customerSockets[userId]) {
            customerSockets[userId] = new Set();
        }
        customerSockets[userId].add(socket.id);

        socket.on('send_message_to_admin', async (message) => {

            await sendMessageToAdmins(io, userId, message, adminSockets);
        });

        socket.on('disconnect', () => {
            if (customerSockets[userId]) {
                customerSockets[userId].delete(socket.id);
                if (customerSockets[userId].size === 0) {
                    delete customerSockets[userId];
                }
            }
        });
    });

    // Xử lý admin kết nối
    adminNamespace.on('connection', (socket) => {
        const adminUserId = socket.handshake.query.userId;
        if (!adminUserId) {
            console.log('Admin connection missing userId');
            return socket.disconnect();
        }

        adminSockets[adminUserId] = socket.id;
        socketToUserMap[socket.id] = adminUserId;

        socket.on('send_message_to_customer', async (toUserId, message) => {
            await sendMessageToCustomer(io, adminUserId, toUserId, message, customerSockets);
        });

        socket.on('disconnect', () => {

            delete adminSockets[adminUserId];
            delete socketToUserMap[socket.id];
        });
    });

    return io;
};

export default socketConfig;
