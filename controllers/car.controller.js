import CarRepository from "../repositories/car.repository.js";
import UserRepository from "../repositories/user.repository.js";

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

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                message: "Error creating car",
                error: error.message || JSON.stringify(error),
            });
        }
    },

    getCarById: async (req, res) => {
        try {
            const id = req.query.id;
            const response = await CarRepository.getCarById(id);
            if (!response) {
                return res.status(404).json({
                    message: "Car not found",
                });
            }
            return res.status(200).json({
                message: "Car retrieved successfully",
                data: response,
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving car",
                error: error.message || JSON.stringify(error),
            });
        }
    },

    getCarListing: async (req, res) => {
        try {
            const data = req.body;
            const response = await CarRepository.getCarListing(data);
            return res.status(200).json({
                message: "Car listing retrieved successfully",
                data: response,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving car listing",
                error: error.message || JSON.stringify(error),
            });
        }
    },

    likeCar: async (req, res) => {
        try {
            const {userId, carId} = req.body;
            const response = await CarRepository.likeCar(userId, carId);
            return res.status(200).json({
                message: "Car liked successfully",
                data: response,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Error liking car",
                error: error.message || JSON.stringify(error),
            });
        }
    },

    getRecommendCarsFromLiked: async (req, res) => {
        try {
            const userId = req.user.id;
            const {limit} = req.body;

            const user = await UserRepository.getUserById(userId);

            if (!user || !user.likedCars || user.likedCars.length === 0) {
                // Nếu user không like cái nào → trả random luôn
                const randomCars = await CarRepository.findRandomCars(limit);
                return res.status(200).json({
                    message: "No liked cars found, showing random cars",
                    data: randomCars,
                });
            }

            const likedCarIds = user.likedCars;
            const likedCars = await CarRepository.findCarsByIds(likedCarIds);

            const brands = likedCars.map(car => car.brand);
            const types = likedCars.map(car => car.type);

            const recommendedCars = await CarRepository.findCarsByBrandOrType(brands, types, likedCarIds, limit);

            const fullInfoCar = await CarRepository.getFullInfoCar(recommendedCars);

            if (!recommendedCars || recommendedCars.length === 0) {
                // Nếu không tìm được xe cùng brand/type → random
                const randomCars = await CarRepository.findRandomCars(limit);
                const fullInfoCar = await CarRepository.getFullInfoCar(randomCars);
                return res.status(200).json({
                    message: "No matching cars found, showing random cars",
                    data: fullInfoCar,
                });
            }

            return res.status(200).json({
                message: "Found recommended cars",
                data: fullInfoCar,
            });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                message: "Error recommending cars",
                error: error.message || JSON.stringify(error),
            });
        }
    },

    getPopularCar: async (req, res) => {
        try {
            const popularCars = await CarRepository.getPopularCar();
            res.status(200).json({
                message: 'Popular cars fetched successfully',
                data: popularCars,
            });
        } catch (error) {
            console.error('Error fetching popular cars:', error);
            res.status(500).json({
                message: 'Error fetching popular cars',
            });
        }
    },
};

export default CarController;