import CarBrand from "../models/car_brand.model.js";

const CarBrandRepository = {
    createCarBrand: async (data) => {
        try {
            const carBrand = new CarBrand();
            carBrand.name = data.name;
            await carBrand.save();

            return {
                message: "Car brand created successfully",
                carBrand: carBrand,
            };
        } catch (error) {
            return {
                message: "Error creating car brand",
                error: error,
            };
        }
    },
    getCarBrands: async () => {
        try {
            const carBrands = await CarBrand.find();
            return {
                message: "Car brands retrieved successfully",
                data: carBrands,
            };
        } catch (error) {
            throw new Error("Error retrieving car brands");
        }
    },


}

export default CarBrandRepository;