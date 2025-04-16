import CarRepository from "../repositories/car.repository.js";

const CarController = {
    createNewCar: async (req, res) => {
        try {
            const imageLinks = req.files.map(file => file.path);
            const carData = {
                ...req.body,
                image: imageLinks,
            };
    
            const response = await CarRepository.createNewCar(carData);
    
            return res.status(201).json({
                message: "Car created successfully",
                data: response,
            });
    
        } catch(error) {
            console.error("🔥 Error:", error);
            return res.status(500).json({
                message: "Error creating car",
                error: error.message || JSON.stringify(error),
            });
        }
    }
    
};

export default CarController;