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

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = new User({
            fullname,
            email,
            password: hashPassword,
            address,
            salt
        });

        try {
            // Thiếu gửi email xác thực tài khoản
            // Gửi email xác thực tài khoản, nếu click vào link thì sẽ được xác thực tài khoản, chuyên verificationStep = 1
            await sendMailController.sendWelcomeEmail(email);
            const token = sendMailController.generateVerificationToken(email);
            await sendMailController.sendVerificationEmail(email, token);

            // Lưu tài khoản vào database
            await user.save();

            return {
                message: "User created successfully",
                user: UserView(user),
            };
        } catch (error) {
            return {
                message: "Error creating user",
                error: error,
            };
        }
    },

    // verify email
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
    }
}

export default UserRepository;