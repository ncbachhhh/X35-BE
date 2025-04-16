import mongoose from "mongoose";

const carBrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const CarBrand = mongoose.model("car_brands", carBrandSchema);
export default CarBrand;
