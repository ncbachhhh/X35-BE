import Feedback from "../models/feedback.model.js";
import Car from "../models/car.model.js";

const FeedbackRepository = {
    createFeedback: async ({userId, carId, rate, comment}) => {
        try {
            // 1. Tạo feedback mới
            const feedback = new Feedback({
                user: userId,
                car: carId,
                rate,
                comment,
            });
            await feedback.save();

            // 2. Lấy tất cả feedback của xe đó
            const allFeedbacks = await Feedback.find({car: carId});
            const totalRate = allFeedbacks.reduce((sum, fb) => sum + fb.rate, 0);
            const avgRate = (totalRate / allFeedbacks.length).toFixed(1); // giữ 1 chữ số thập phân

            // 3. Cập nhật lại trường rate trong Car
            await Car.findByIdAndUpdate(carId, {rate: avgRate});

            return {
                success: true,
                message: "Feedback submitted and car rating updated",
                feedback,
                averageRate: avgRate,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to submit feedback",
                error: error.message,
            };
        }
    },

    getFeedbacksForCar: async (carId) => {
        try {
            const feedbacks = await Feedback.find({car: carId})
                .populate("user", "fullname profilePicture")
                .sort({createdAt: -1});

            return {
                success: true,
                data: feedbacks,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to fetch feedbacks",
                error: error.message,
            };
        }
    },
};

export default FeedbackRepository;
