import CarGearbox from "../models/car_gearbox.model.js";

const CarGearboxRepository = {
    createCarGearbox: async (data) => {
        try {
            const carGearbox = new CarGearbox();
            carGearbox.name = data.name;
            await carGearbox.save();

            return carGearbox;
        } catch (error) {
            return {
                message: "Error creating car gearbox",
                error: error,
            };
        }
    }
}

export default CarGearboxRepository;