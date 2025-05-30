import Bill from '../models/bill.model.js';

const BillRepository = {
    getRentedCarsByUser: async (userId) => {
        const bills = await Bill.find({user: userId})
            .populate({
                path: 'car',
                populate: [
                    {path: 'brand', select: 'name'},
                    {path: 'type', select: 'name'},
                    {path: 'gearbox', select: 'name'}
                ]
            }) // Lấy chi tiết xe
            .sort({createdAt: -1}); // Sắp xếp mới nhất trước

        return bills; // Trả về danh sách các xe
    },

    getRevenueByMonth: async (startDate, endDate) => {
        const stats = await Bill.aggregate([
            {
                $match: {
                    createdAt: {$gte: startDate, $lte: endDate},
                    transactionStatus: "00", // Lọc hoá đơn đã thanh toán thành công (bạn đổi nếu khác)
                },
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m", date: "$createdAt"}},
                    revenue: {$sum: "$amount"},
                },
            },
            {
                $sort: {_id: 1},
            },
        ]);

        return stats.map((item) => ({
            month: item._id,
            revenue: item.revenue,
        }));
    },
};

export default BillRepository;