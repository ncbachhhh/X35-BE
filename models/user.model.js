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
    password: {
        type: String,
        required: true,
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
}, {timestamps: true});

const User = mongoose.model('users', userSchema);
export default User;