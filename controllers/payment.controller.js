import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import QRCode from 'qrcode';
import Bill from '../models/bill.model.js';
import mongoose from 'mongoose';
import Car from "../models/car.model.js";

const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
};

const paymentController = {
    createVNPayUrl: async (req, res) => {
        try {
            const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const {
                orderId,
                amount,
                bankCode,
                carId,
                name,
                address,
                phone,
                city,
                'pick-date': pickDate,
                'pick-time': pickTime,
                'drop-date': dropDate,
                'drop-time': dropTime,
                'pick-location': pickLocation,
                'drop-location': dropLocation
            } = req.body;

            const tmnCode = process.env.VNP_TMNCODE;
            const secretKey = process.env.VNP_HASH_SECRET;
            const vnpUrl = process.env.VNP_URL;
            const returnBaseUrl = process.env.VNP_RETURN_URL;
            const returnUrl = `${returnBaseUrl}/api/payment/vnpay_return?redirectUrl=http://localhost:3000/payment/${carId}`;
            const createDate = moment().format('YYYYMMDDHHmmss');
            const userId = req.user?.id;

            let vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
                vnp_OrderType: 'other',
                vnp_Amount: amount * 100,
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
            };

            if (bankCode) {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            const signData = qs.stringify(sortObject(vnp_Params), {encode: false});
            const signed = crypto.createHmac('sha512', secretKey)
                .update(Buffer.from(signData, 'utf-8'))
                .digest('hex');
            vnp_Params['vnp_SecureHash'] = signed;

            const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, {encode: false})}`;
            const qrCode = await QRCode.toDataURL(paymentUrl);

            // Kiểm tra xem hóa đơn đã tồn tại chưa
            const existingBill = await Bill.findOne({orderId});
            if (!existingBill) {
                await Bill.create({
                    user: userId ? new mongoose.Types.ObjectId(userId) : null,
                    car: new mongoose.Types.ObjectId(carId),
                    orderId,
                    amount,
                    bankCode,
                    transactionDate: createDate,
                    responseCode: '',
                    transactionStatus: 'pending',
                    name,
                    address,
                    phone,
                    city,
                    pickDate,
                    pickTime,
                    dropDate,
                    dropTime,
                    pickLocation,
                    dropLocation
                });
            }

            return res.status(200).json({
                isSuccess: true,
                message: 'QR generated and bill created successfully',
                paymentUrl,
                qrCode,
                orderId,
            });
        } catch (error) {
            console.error('❌ VNPay error:', error);
            return res.status(500).json({
                isSuccess: false,
                message: 'Lỗi tạo QR thanh toán',
                error: error.message,
            });
        }
    },
    handleVNPayReturn: async (req, res) => {
        try {
            const {vnp_SecureHash, ...params} = req.query;
            const redirectUrl = params.redirectUrl || 'http://localhost:3000';
            delete params.redirectUrl;

            const secretKey = process.env.VNP_HASH_SECRET;
            const sortedParams = sortObject(params);
            const signData = qs.stringify(sortedParams, {encode: false});
            const signed = crypto.createHmac('sha512', secretKey)
                .update(Buffer.from(signData, 'utf-8'))
                .digest('hex');

            if (signed !== vnp_SecureHash) {
                return res.status(400).json({isSuccess: false, message: 'Invalid checksum'});
            }

            const bill = await Bill.findOne({orderId: params.vnp_TxnRef});
            if (!bill) {
                return res.status(404).json({isSuccess: false, message: 'Bill not found'});
            }

            bill.transactionStatus = params.vnp_TransactionStatus;
            bill.responseCode = params.vnp_ResponseCode;
            bill.transactionDate = params.vnp_PayDate;
            bill.bankCode = params.vnp_BankCode || bill.bankCode;
            await bill.save();

            if (params.vnp_ResponseCode === '00') {
                const car = await Car.findById(bill.car);
                if (car) {
                    car.beingRented = true;
                    await car.save();
                }
            }

            return res.redirect(`${redirectUrl}?success=${params.vnp_ResponseCode === '00'}`);
        } catch (error) {
            console.error('❌ handleVNPayReturn error:', error);
            return res.status(500).json({
                isSuccess: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
};

export default paymentController;
