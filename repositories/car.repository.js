import Car from "../models/car.model.js";

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
};
export default CarRepository;
