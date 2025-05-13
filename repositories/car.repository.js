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
            console.error("Lỗi trong repository:", error);
            const errorMessage = error?.message || JSON.stringify(error);
            throw new Error("Lỗi khi tạo xe: " + errorMessage);
        }
    },

    getCarById: async (id) => {
        try {
            // Truy vấn xe với các thông tin liên quan thông qua populate
            const car = await Car.findById(id)
                .populate('type', 'name')   // Populate trường type và chỉ lấy tên
                .populate('brand', 'name')  // Populate trường brand và chỉ lấy tên
                .populate('gearbox', 'name'); // Populate trường gearbox và chỉ lấy tên

            // Kiểm tra nếu xe không tồn tại
            if (!car) {
                throw new Error("Car not found");
            }

            // Trả về thông tin xe cùng với các thông tin chi tiết đã populate
            const newCar = {
                _id: car._id,
                name: car.name,
                brand: car.brand.name,         // Lấy tên thương hiệu từ populated data
                type: car.type.name,           // Lấy tên loại xe từ populated data
                gearbox: car.gearbox.name,     // Lấy tên hộp số từ populated data
                price: car.price,
                image: car.image,
                description: car.description,
                seat: car.seat,
                tank: car.tank,
                beingRented: car.beingRented,
                createdAt: car.createdAt,
                updatedAt: car.updatedAt
            }

            return newCar;

        } catch (error) {
            console.error("Error in repository:", error);
            throw new Error("Error fetching car: " + (error.message || JSON.stringify(error)));
        }
    },

    getCarListing: async (data) => {
        const {keyword, type, capacity, price, gearbox, sortBy, page, limit} = data;
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
    },

    findCarsByIds: async (ids) => {
        const cars = await Car.find({
            _id: {$in: ids}
        }).lean(); // Trả về object JS thường
        return cars;
    },

    findCarsByBrandOrType: async (brands, types, excludeIds, limit) => {
        const cars = await Car.find({
            _id: {$nin: excludeIds}, // Không lấy lại xe đã like
            $or: [
                {brand: {$in: brands}},
                {type: {$in: types}}
            ]
        }).limit(limit).lean();
        return cars;
    },

    findRandomCars: async (limit) => {
        const cars = await Car.find({})
            .limit(limit)
            .lean();
        return cars;
    },

    getFullInfoCar: async (cars) => {
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

        return fullInfoCar;
    },

    getPopularCar: async () => {
        try {
            const cars = await Car.find()
                .sort({rentCount: -1})
                .limit(4)
                .populate('type', 'name')   // Populate trường type và chỉ lấy tên
                .populate('brand', 'name')  // Populate trường brand và chỉ lấy tên
                .populate('gearbox', 'name'); // Populate trường gearbox và chỉ lấy tên

            const newCars = cars.map(car => ({
                _id: car._id,
                name: car.name,
                brand: car.brand.name,
                type: car.type.name,
                gearbox: car.gearbox.name,
                price: car.price,
                image: car.image,
                description: car.description,
                seat: car.seat,
                tank: car.tank,
                beingRented: car.beingRented,
                createdAt: car.createdAt,
                updatedAt: car.updatedAt
            }));

            return newCars;
        } catch (error) {
            console.error('Error fetching popular cars:', error);
        }
    }

};
export default CarRepository;
