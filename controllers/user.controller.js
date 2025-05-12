import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import UserView from "../views/user.view.js";
import jwt from "jsonwebtoken";
import BillRepository from "../repositories/bill.repository.js";

const UserController = {
    createUser: async (req, res) => {
        try {
            const {email, password, name} = req.body;
            // Kiểm tra xem email đã được đăng ký chưa
            const existEmail = await UserRepository.getUserByEmail(email);
            if (existEmail) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }
            // Tạo người dùng mới
            const result = await UserRepository.createUser(req.body);
            // Trả về người dùng mới với mã trạng thái 201 (Đã tạo)
            return res.status(201).json({
                message: "Create user successfully",
                user: result.user,
            });
        } catch (error) {
            // Bắt các lỗi không mong muốn và trả về mã lỗi 500
            return res.status(500).json({
                message: "Error creating user",
                error: error.message,
            });
        }
    },

    login: async (req, res) => {
        const {email, password, remember} = req.body;

        // Lấy user từ DB
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({
                message: "Email not found",
            });
        }

        // So sánh với mật khẩu mới nhất trong danh sách passwords
        const isMatch = await bcrypt.compare(password, user.passwords[0]);
        if (!isMatch) {
            return res.status(400).json({
                message: "Password is incorrect",
            });
        }

        // Tạo access token & refresh token
        const secretKey = process.env.JWT_SECRET_KEY;
        const accessTokenExpires = process.env.JWT_ACCESS_TOKEN_EXPIRES;
        const refreshTokenExpires = process.env.JWT_REFRESH_TOKEN_EXPIRES;

        const payload = {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
        };

        const accessToken = jwt.sign(payload, secretKey, {expiresIn: accessTokenExpires});
        const refreshToken = jwt.sign(payload, secretKey, {expiresIn: refreshTokenExpires});

        return res.status(200).json({
            message: "Login successfully",
            data: {
                ...UserView(user),
                accessToken,
                refreshToken,
            }
        });
    },

    getProfile: async (req, res) => {
        const userId = (req.user).id;

        const user = await UserRepository.getUserById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Get user profile successfully",
            data: {
                ...UserView(user),
            }
        });
    },

    verifyEmail: async (req, res) => {
        const {token} = req.body;

        const response = await UserRepository.verifyEmail(token);
        if (response.error) {
            return res.status(400).json({
                message: response.message,
                error: response.error,
            });
        }
        return res.status(200).json({
            message: response.message,
            user: response.user,
        });
    },

    sendResetPasswordEmail: async (req, res) => {
        const {email} = req.body;
        const response = await UserRepository.sendResetPasswordEmail(email);
        if (!response.success) {
            return res.status(400).json({
                message: response.message,
                error: response.error,
            });
        }
        return res.status(200).json({
            message: response.message,
            token: response.token,
        });
    },

    verifyCodeAndResetPassword: async (req, res) => {
        let {token, password, code} = req.body;
        code = Number(code);
        const response = await UserRepository.verifyCodeAndResetPassword(token, password, code);
        if (!response.success) {
            return res.status(400).json({
                message: response.message,
                error: response.error,
            });
        }
        return res.status(200).json({
            message: response.message,
            user: response.user,
        });
    },

    addRecentViewedCar: async (req, res) => {
        try {
            const userId = req.user.id;
            const {carId} = req.body;

            if (!carId) {
                return res.status(400).json({message: "Car ID is required"});
            }

            await UserRepository.addRecentViewedCar(userId, carId);

            return res.status(200).json({message: "Car added to recent viewed list"});

        } catch (error) {
            console.error("🔥 Error in addRecentViewedCar:", error);
            res.status(500).json({message: "Failed to update recent viewed", error: error.message});
        }
    },

    getRecentViewedCars: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await UserRepository.getUserWithRecentCars(userId);

            const result = user.recentViewedCars.map(car => {
                const carObj = car.toObject();
                return {
                    ...carObj,
                    brand: carObj.brand?.name || '',
                    type: carObj.type?.name || '',
                    gearbox: carObj.gearbox?.name || ''
                };
            });

            return res.status(200).json({
                message: "Recent viewed cars fetched successfully",
                data: result || []
            });

        } catch (error) {
            console.error("🔥 Error in getRecentViewedCars:", error);
            res.status(500).json({message: "Failed to fetch recent viewed cars", error: error.message});
        }
    },

    changePassword: async (req, res) => {
        try {
            const userId = req.user.id;
            const {oldPassword, newPassword} = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({message: "Missing required fields"});
            }

            const user = await UserRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // So sánh mật khẩu hiện tại (mới nhất)
            const isMatch = await bcrypt.compare(oldPassword, user.passwords[0]);
            if (!isMatch) {
                return res.status(400).json({message: "Old password is incorrect"});
            }

            // Kiểm tra nếu newPassword trùng với bất kỳ 1 trong 3 mật khẩu gần nhất
            for (let old of user.passwords) {
                if (await bcrypt.compare(newPassword, old)) {
                    return res.status(400).json({message: "New password must be different from the last 3 passwords"});
                }
            }

            // Hash và thêm mật khẩu mới vào đầu mảng
            const newHashed = await bcrypt.hash(newPassword, user.salt);
            user.passwords.unshift(newHashed);

            // Chỉ giữ lại 3 mật khẩu gần nhất
            user.passwords = user.passwords.slice(0, 3);

            await user.save();

            return res.status(200).json({message: "Password changed successfully"});

        } catch (error) {
            console.error("❌ Change password error:", error);
            return res.status(500).json({message: "Failed to change password", error: error.message});
        }
    },

    returnCar: async (req, res) => {
        const {billId} = req.body;
        if (!billId) {
            return res.status(400).json({message: "Bill ID is required"});
        }
        const response = await UserRepository.returnCar(billId);
        if (response) {
            return res.status(200).json({
                message: "Car returned successfully",
            });
        } else {
            return res.status(400).json({
                message: "Error returning car",
            });
        }
    },

    getUserRentedCars: async (req, res) => {
        try {
            const userId = req.user.id;
            const rentedCars = await BillRepository.getRentedCarsByUser(userId);

            return res.status(200).json({
                message: "Fetched rented cars successfully",
                data: rentedCars
            });
        } catch (error) {
            console.error("❌ Error in getUserRentedCars:", error);
            return res.status(500).json({
                message: "Failed to get rented cars",
                error: error.message
            });
        }
    },
    
}

export default UserController;