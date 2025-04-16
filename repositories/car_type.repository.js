import CarType from "../models/car_type.model,js.js";

const CarTypeRepository = {
    createCarType: async (data) => {
        try {
            const newCarType = new CarType();
            newCarType.name = data.name;
            await newCarType.save();

            return newCarType;
        } catch (error) {
            return {
                message: "Error creating car type",
                error: error,
            };
        }
    }
}

export default CarTypeRepository;