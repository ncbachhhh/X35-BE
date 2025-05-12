import FeedbackRepository from "../repositories/feedback.repository.js";

const FeedbackController = {
    createFeedback: async (req, res) => {
        try {
            const userId = req.user.id; // Đảm bảo middleware xác thực đã gán req.user
            const {carId, rate, comment} = req.body;
            console.log({
                userId,
                carId,
                rate,
                comment
            })
            if (!carId || !rate) {
                return res.status(400).json({message: "Missing required fields"});
            }

            const result = await FeedbackRepository.createFeedback({userId, carId, rate, comment});

            if (!result.success) {
                return res.status(400).json({message: result.message, error: result.error});
            }

            return res.status(201).json({
                message: result.message,
                feedback: result.feedback,
                averageRate: result.averageRate,
            });
        } catch (error) {
            return res.status(500).json({message: "Server error", error: error.message});
        }
    },

    getFeedbacksByCar: async (req, res) => {
        try {
            const {carId} = req.params;

            if (!carId) {
                return res.status(400).json({message: "Car ID is required"});
            }

            const result = await FeedbackRepository.getFeedbacksForCar(carId);

            if (!result.success) {
                return res.status(400).json({message: result.message, error: result.error});
            }

            return res.status(200).json({
                message: "Feedbacks fetched successfully",
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({message: "Server error", error: error.message});
        }
    },
};

export default FeedbackController;
