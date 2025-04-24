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
    },
    getCarGearbox: async () => {
        try {
            const carGearboxes = await CarGearbox.find();
            return {
                message: "Car gearboxes retrieved successfully",
                data: carGearboxes,
            };
        } catch (error) {
            throw new Error("Error retrieving car gearbox");
        }
    },
    getCarGearboxById: async (id) => {
        try {
            const carGearbox = await CarGearbox.findById(id);
            if (!carGearbox) {
                throw new Error("Car gearbox not found");
            }
            return {
                carGearbox: carGearbox,
            };
        } catch (error) {
            throw new Error("Error retrieving car gearbox");
        }
    }
}

export default CarGearboxRepository;