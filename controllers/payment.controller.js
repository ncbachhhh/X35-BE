import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import QRCode from 'qrcode';

const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

export const createVNPayUrl = async (req, res) => {
    try {
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = req.body.orderId;
        const amount = req.body.amount; // VND * 100
        const locale = "vn";
        const currCode = "VND";
        const bankCode = req.body.bankCode;


        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = `Thanh toán đơn hàng ${orderId}`;
        vnp_Params['vnp_OrderType'] = "other";
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, {encode: false});
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnp_Params['vnp_SecureHash'] = signed;

        const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, {encode: false})}`;
        const qrCode = await QRCode.toDataURL(paymentUrl); // Tạo ảnh QR

        return res.status(200).json({
            paymentUrl,
            qrCode
        });
        // res.redirect(paymentUrl);

    } catch (error) {
        console.error("❌ VNPay error:", error);
        return res.status(500).json({message: "Lỗi tạo QR thanh toán", error: error.message});
    }
};