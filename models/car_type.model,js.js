import mongoose from "mongoose";

const carTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const CarType = mongoose.model("car_types", carTypeSchema);
export default CarType;