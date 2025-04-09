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

    sendWelcomeEmail: async (email) => {
        const mailOptions = {
            from: `${process.env.NODE_MAILER_GMAIL}`,
            to: email,
            subject: 'Welcome to our service',
            text: 'Thank you for registering with us!',
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Welcome email sent');
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }
}

export default sendMailController;