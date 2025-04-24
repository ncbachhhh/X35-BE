import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import UserView from "../views/user.view.js";
import jwt from "jsonwebtoken";

const UserController = {
    createUser: async (req, res) => {
        try {
            const { email, password, name } = req.body;
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

        // Check if the email is already registered
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({
                message: "Email not found",
            });
        }

        // Check if the password is correct
        const salt = user.salt;
        const hashPassword = await bcrypt.hash(password, salt);
        if (user.password !== hashPassword) {
            return res.status(400).json({
                message: "Password is incorrect",
            });
        }

        // Password is correct, generate JWT tokens
        // Generate JWT tokens

        // Check if remember me is checked
        const secretKey = process.env.JWT_SECRET_KEY;
        const accessTokenExpires = process.env.JWT_ACCESS_TOKEN_EXPIRES;
        const refreshTokenExpires = process.env.JWT_REFRESH_TOKEN_EXPIRES;

        const accessTokenPayload = {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
        }

        const accessToken = jwt.sign(accessTokenPayload, secretKey, {
            expiresIn: accessTokenExpires,
        });

        const refreshToken = jwt.sign(accessTokenPayload, secretKey, {
            expiresIn: refreshTokenExpires,
        });

        return res.status(200).json({
            message: "Login successfully",
            data: {
                ...UserView(user),
                accessToken,
                refreshToken,
            }
        })

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
    }
}

export default UserController;