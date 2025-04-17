import CarGearboxRepository from "../repositories/car_gearbox.repository.js";

const CarGearboxController = {
    createCarGearbox: async (req, res) => {
        const response = await CarGearboxRepository.createCarGearbox(req.body);
        if (response.error) {
            return res.status(500).json({
                message: response.message,
                error: response.error,
            });
        }
        return res.status(200).json({
            message: response.message,
            data: response,
        });
    },
    getCarGearbox: async (req, res) => {
        try {
            const response = await CarGearboxRepository.getCarGearbox();
            return res.status(200).json({
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving car gearboxes",
            });
        }
    }
}

export default CarGearboxController;