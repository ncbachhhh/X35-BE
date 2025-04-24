import {v4} from "uuid";
import jwt from "jsonwebtoken";
import transporter from "../configs/nodemailer.config.js";

const sendMailController = {
    generateVerificationToken: (email) => {
        const tokenId = v4();
        const expiresIn = "1h";
        const payload = {
            email,
            tokenId,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn});
        return token;
    },

    generateVerification6DigitsCode: (email) => {
        const code = Math.floor(100000 + Math.random() * 900000);
        const expiresIn = "15m";
        const payload = {
            email,
            code,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn});
        return token;
    },

    sendResetPasswordEmail: async (email, token) => {
        const code = jwt.decode(token, process.env.JWT_SECRET_KEY);
        const mailOptions = {
            from: `${process.env.NODE_MAILER_GMAIL}`,
            to: email,
            subject: "Reset your password",
            text: `Your verification code is: ${code.code}. It will expire in 15 minutes.`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending reset password email:', error);
        }
    },

    sendVerificationEmail: async (email, token) => {
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        const mailOptions = {
            from: `${process.env.NODE_MAILER_GMAIL}`,
            to: email,
            subject: 'Verify your email address',
            text: `Click the link to verify your email: ${verificationLink}`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending verification email:', error);
        }
    },
}

export default sendMailController;