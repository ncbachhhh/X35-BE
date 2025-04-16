import mongoose from 'mongoose'

const carGearboxSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const CarGearbox = mongoose.model('car_gearboxes', carGearboxSchema);
export default CarGearbox;