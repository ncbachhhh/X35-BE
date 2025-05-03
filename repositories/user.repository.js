import User from "../models/user.model.js";
import UserView from "../views/user.view.js";
import bcrypt from "bcrypt";
import sendMailController from "../controllers/sendmail.controller.js";
import jwt from "jsonwebtoken";


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
            const hashPassword = await bcrypt.hash(password, salt);

            // Tạo đối tượng người dùng
            const user = new User({
                fullname,
                email,
                password: hashPassword,
                address,
                salt
            });

            // Lưu người dùng vào cơ sở dữ liệu trước khi gửi email xác thực
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
            if (code === decoded.code) {
                const salt = user.salt;
                const hashPassword = await bcrypt.hash(password, salt);
                user.password = hashPassword;
                await user.save();

                return {
                    message: "Password reset successfully",
                    success: true,
                    user: UserView(user),
                };
            } else {
                return {
                    message: "Code is incorrect",
                    success: false,
                }
            }
        } catch (error) {
            return {
                message: "Token expired or invalid",
                success: false,
                error: error,
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
}

export default UserRepository;