import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwords: {
        type: [String], // Lưu trữ các mật khẩu đã băm
        required: true,
        validate: [arr => arr.length > 0 && arr.length <= 3, 'Must have 1-3 passwords']
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    verificationStep: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    salt: {
        type: String,
    },
    likedCars: [mongoose.Schema.Types.ObjectId],
    recentViewedCars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cars'
    }]
}, {timestamps: true});

const User = mongoose.model('users', userSchema);
export default User;
