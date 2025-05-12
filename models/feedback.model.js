import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
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
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const Feedback = mongoose.model('feedbacks', feedbackSchema);
export default Feedback;
