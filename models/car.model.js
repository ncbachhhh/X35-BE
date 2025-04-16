import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarBrand',
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarType',
        required: true,
    },
    gearbox: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarGearbox',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: [String],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    seat: {
        type: Number,
        required: true,
    },
    tank: {
        type: Number,
        required: true,
    },
}, {timestamps: true});

const Car = mongoose.model('Car', carSchema);
export default Car;
