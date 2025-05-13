import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'car_brands',
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'car_types',
        required: true,
    },
    gearbox: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'car_gearboxes',
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
    rate: {
        type: Number,
        default: 0,
    },
    beingRented: {
        type: Boolean,
        default: false,
    },
    rentCount: {
        type: Number,
        default: 0,
    }
}, {timestamps: true});

const Car = mongoose.model('cars', carSchema);
export default Car;
