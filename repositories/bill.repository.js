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
    }
};

export default BillRepository;