import User from "../models/user.model.js";
import UserView from "../views/user.view.js";
import bcrypt from "bcrypt";
import sendMailController from "../controllers/sendmail.controller.js";
import jwt from "jsonwebtoken";
import Bill from "../models/bill.model.js";
import Car from "../models/car.model.js";
import moment from "moment";


const UserRepository = {
    getUserByEmail: async (email) => {
        const user = await User.findOne({email: email});
        return user;
    },

    getUserById: async (id) => {
        const user = await User.findById(id);
        return user;
    },

    createUser: async (data) => {
        const {fullname, email, password, address} = data;

        try {
            // Tạo salt và mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo đối tượng người dùng với mật khẩu đầu tiên trong mảng passwords
            const user = new User({
                fullname,
                email,
                passwords: [hashedPassword], // ← sử dụng mảng passwords thay vì password
                address,
                salt
            });

            // Lưu người dùng vào cơ sở dữ liệu
            await user.save();

            // Gửi email xác thực tài khoản
            const token = sendMailController.generateVerificationToken(email);
            await sendMailController.sendVerificationEmail(email, token);

            return {
                message: "User created successfully",
                user: UserView(user),
            };
        } catch (error) {
            return {
                message: "Error creating user",
                error: error.message || error,
            };
        }
    },

    verifyEmail: async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findOne({email: decoded.email});
            if (!user) {
                return {
                    message: "User not found",
                };
            }
            ;

            user.verificationStep = 1;
            await user.save();

            return {
                message: "Email verified successfully",
                user: UserView(user),
            };
        } catch (error) {
            return {
                message: "Token expired or invalid",
                error: error,
            };
        }
    },

    sendResetPasswordEmail: async (email) => {
        try {
            const token = sendMailController.generateVerification6DigitsCode(email);
            await sendMailController.sendResetPasswordEmail(email, token);
            return {
                token: token,
                success: true,
                message: "Reset password email sent successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: "Error sending email",
                error: error,
            };
        }

    },

    verifyCodeAndResetPassword: async (token, password, code) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findOne({email: decoded.email});

            if (!user) {
                return {
                    message: "User not found",
                    success: false,
                };
            }

            if (code !== decoded.code) {
                return {
                    message: "Code is incorrect",
                    success: false,
                };
            }

            const salt = user.salt;
            const newHashedPassword = await bcrypt.hash(password, salt);

            // Kiểm tra xem mật khẩu mới có trùng với bất kỳ mật khẩu cũ nào không
            const isRecentlyUsed = await Promise.any(
                user.passwords.map(async (oldPass) => await bcrypt.compare(password, oldPass))
            ).catch(() => false);

            if (isRecentlyUsed) {
                return {
                    message: "This password was used recently. Please choose a new one.",
                    success: false,
                };
            }

            // Thêm mật khẩu mới vào đầu mảng passwords
            user.passwords.unshift(newHashedPassword);
            user.passwords = user.passwords.slice(0, 3); // Giữ lại 3 cái gần nhất

            await user.save();

            return {
                message: "Password reset successfully",
                success: true,
                user: UserView(user),
            };
        } catch (error) {
            return {
                message: "Token expired or invalid",
                success: false,
                error: error.message || error,
            };
        }
    },

    getUserWithRecentCars: async (userId) => {
        const cars = await User.findById(userId)
            .populate({
                path: 'recentViewedCars',
                populate: [
                    {path: 'brand', select: 'name'},
                    {path: 'type', select: 'name'},
                    {path: 'gearbox', select: 'name'}
                ]
            });
        return cars;
    },

    addRecentViewedCar: async (userId, carId) => {
        const user = await User.findById(userId);
        if (!user) return null;

        user.recentViewedCars = user.recentViewedCars.filter(id => id.toString() !== carId);
        user.recentViewedCars.unshift(carId);
        user.recentViewedCars = user.recentViewedCars.slice(0, 3);

        return await user.save();
    },

    returnCar: async (billId) => {
        const bill = await Bill.findById(billId);
        if (!bill) {
            return null;
        }
        const car = await Car.findById(bill.car);
        car.beingRented = false;
        await car.save();

        return bill;
    },

    getUserList: async (page, limit) => {
        const skip = (page - 1) * limit;
        const users = await User.find({}).skip(skip).limit(limit);
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users: users,
            totalUsers,
            totalPages,
            currentPage: page
        };
    },

    updateUser: async (data) => {
        const {userId, fullname, email, address, role} = data;
        const user = await User.findById(userId);
        if (!user) {
            return {
                message: "User not found",
                success: false,
            }
        }

        user.fullname = fullname;
        user.email = email;
        user.address = address;
        user.role = role;

        await user.save();
        return {
            message: "User updated successfully",
            success: true,
            user: UserView(user),
        };
    },

    deleteUser: async (id) => {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return {
                    message: "User not found",
                    success: false,
                };
            }
            return {
                message: "User deleted successfully",
                success: true,
            };
        } catch (error) {
            return {
                message: "Error deleting user",
                success: false,
                error: error.message || error,
            };
        }
    },

    getNewUsersByDate: async (startDate, endDate) => {
        // Chuyển startDate, endDate thành ngày chính xác (đầu ngày, cuối ngày)
        const start = moment(startDate).startOf("day").toDate();
        const end = moment(endDate).endOf("day").toDate();

        // Aggregate nhóm theo ngày và đếm số user
        const stats = await User.aggregate([
            {
                $match: {
                    createdAt: {$gte: start, $lte: end},
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {format: "%Y-%m-%d", date: "$createdAt"},
                    },
                    count: {$sum: 1},
                },
            },
            {
                $sort: {_id: 1},
            },
        ]);

        // Chuyển đổi kết quả về dạng [{ date: "2023-05-01", count: 12 }, ...]
        return stats.map((item) => ({
            date: item._id,
            count: item.count,
        }));
    },
}

export default UserRepository;