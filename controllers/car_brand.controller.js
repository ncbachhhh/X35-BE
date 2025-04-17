import CarBrandService from "../repositories/car_brand.repository.js";

const CarBrandController = {
    createCarBrand: async (req, res) => {
        const response = await CarBrandService.createCarBrand(req.body);
        if (response.error) {
            return res.status(400).json({
                message: response.message,
                error: response.error,
            });
        }
        return res.status(200).json({
            message: response.message,
            carBrand: response.carBrand,
        });
    },
    getCarBrand: async (req, res) => {
        try {
            const response = await CarBrandService.getCarBrands();
            return res.status(200).json({
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving car brands",
            });
        }
    }
}

export default CarBrandController;