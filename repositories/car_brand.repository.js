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
    }
}

export default CarBrandRepository;