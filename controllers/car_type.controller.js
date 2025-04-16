import CarTypeRepository from "../repositories/car_type.repository.js";

const CarTypeController = {
    createCarType: async (req, res) => {
        const response = await CarTypeRepository.createCarType(req.body);
        if (response.error) {
            return res.status(500).json({
                message: "Error creating car type",
                error: response.error,
            });
        }
        return res.status(200).json({
            message: "Car type created successfully",
            data: response,
        });
    }
}

export default CarTypeController;