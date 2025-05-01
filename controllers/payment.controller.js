import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import QRCode from 'qrcode';

const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
};

export const createVNPayUrl = async (req, res) => {
    try {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const ipAddr = rawIp === '::1' ? '127.0.0.1' : rawIp;

        const tmnCode = '2QXUI4J4';
        const secretKey = 'SECRETKEY1234567890';
        const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = 'http://localhost:3000/payment/callback';

        const date = moment().format('YYYYMMDDHHmmss');
        const orderId = moment().format('DDHHmmss');
        const amount = req.body.amount * 100;

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toan don hang so ${orderId}`,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: date,
        };

        // ✅ Sắp xếp tham số theo thứ tự alphabet
        const sortedParams = sortObject(vnp_Params);

        // ✅ Tạo chữ ký (không encode)
        const signData = qs.stringify(sortedParams, {encode: false});
        const signed = crypto.createHmac('sha512', secretKey)
            .update(signData)
            .digest('hex');

        // ✅ Gán chữ ký vào tham số
        sortedParams.vnp_SecureHash = signed;

        // ✅ Tạo URL có encode (rất quan trọng)
        const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, {encode: true});

        // ✅ Tạo mã QR từ URL
        const qrCode = await QRCode.toDataURL(encodeURI(paymentUrl));

        return res.status(200).json({
            message: 'VNPay payment URL generated successfully',
            paymentUrl,
            qrCode,
        });

    } catch (error) {
        console.error('❌ VNPay error:', error);
        return res.status(500).json({
            message: 'Failed to generate VNPay QR',
            error: error.message,
        });
    }
};
