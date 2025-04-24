import Car from "../models/car.model.js";
import CarTypeRepository from "./car_type.repository.js";
import CarGearboxRepository from "./car_gearbox.repository.js";
import CarBrandRepository from "./car_brand.repository.js";
import User from "../models/user.model.js";

const CarRepository = {
    createNewCar: async (data) => {
        try {
            const car = new Car(data);
            await car.save();
            return car;
        } catch (error) {
            console.error("🔥 Lỗi trong repository:", error);
            const errorMessage = error?.message || JSON.stringify(error);
            throw new Error("Lỗi khi tạo xe: " + errorMessage);
        }
    },
    getCarListing: async (data) => {
        const {keyword, type, capacity, price, gearbox, sortBy, page} = data;
        const query = {}

        if (keyword) {
            query.name = {$regex: keyword, $options: 'i'};
        }
        if (Array.isArray(capacity) && capacity.length > 0) {
            const has8plus = capacity.includes("8plus");
            const numericCapacities = capacity
                .filter(c => c !== "8plus")
                .map(Number)
                .filter(n => !isNaN(n));

            if (has8plus && numericCapacities.length > 0) {
                query.$or = [
                    {seat: {$in: numericCapacities}},
                    {seat: {$gt: 8}}
                ];
            } else if (has8plus) {
                query.seat = {$gt: 8};
            } else {
                query.seat = {$in: numericCapacities};
            }
        }

        if (price) {
            query.price = {$lte: price};
        }

        if (Array.isArray(type) && type.length > 0) {
            query.type = {$in: type};
        }

        if (Array.isArray(gearbox) && gearbox.length > 0) {
            query.gearbox = {$in: gearbox};
        }
        const sort = {};
        if (sortBy) {
            const [field, direction] = sortBy.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        }

        const limit = 12;
        const skip = (page - 1) * limit;
        const total = await Car.countDocuments(query);

        const cars = await Car.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sort);

        const fullInfoCar = await Promise.all(
            cars.map(async (car) => {
                const carType = await CarTypeRepository.getCarTypeById(car.type);
                const carBrand = await CarBrandRepository.getCarBrandById(car.brand);
                const carGearbox = await CarGearboxRepository.getCarGearboxById(car.gearbox);
                return {
                    _id: car._id,
                    name: car.name,
                    brand: carBrand.carBrand.name,
                    type: carType.carType.name,
                    gearbox: carGearbox.carGearbox.name,
                    capacity: car.capacity,
                    tank: car.tank,
                    seat: car.seat,
                    price: car.price,
                    image: car.image,
                    description: car.description,
                    createdAt: car.createdAt,
                    updatedAt: car.updatedAt
                }
            })
        );

        return {
            cars: fullInfoCar,
            total
        }
    },
    likeCar: async (userId, carId) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.likedCars.includes(carId)) {
                user.likedCars = user.likedCars.filter(id => id.toString() !== carId);
            } else {
                user.likedCars.push(carId);
            }
            await user.save();
        } catch (error) {
            throw new Error("Error like car: " + (error?.message || JSON.stringify(error)));
        }
    }
};
export default CarRepository;
