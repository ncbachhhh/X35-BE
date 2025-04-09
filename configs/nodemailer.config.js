import nodemailer from 'nodemailer';
import {v4} from 'uuid';
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({

    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    // auth: {
    //     user: process.env.NODE_MAILER_GMAIL,
    //     pass: process.env.NODE_MAILER_PASSWORD,
    // },
    auth: {
        user: "rental.morent.info@gmail.com",
        pass: "qpmfufyyzjljaacq",
    }
});

export default transporter;
