import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    orderId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    bankCode: String,
    paymentMethod: String,
    responseCode: String,
    transactionStatus: String,
    transactionDate: String,

    // Customer Info
    name: String,
    phone: String,
    address: String,
    city: String,

    // Pickup Info
    pickDate: String,
    pickTime: String,
    pickLocation: String,

    // Drop-off Info
    dropDate: String,
    dropTime: String,
    dropLocation: String,

    marketing: Boolean,
}, {timestamps: true});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;