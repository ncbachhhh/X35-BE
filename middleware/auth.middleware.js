import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
    const secretKey = process.env.JWT_SECRET_KEY;

    let accessToken = req.get("Authorization");

    if (!accessToken) {
        return res.status(401).json({
            message: "The request was unauthenticated",
        });
    }

    accessToken = accessToken.replace("Bearer ", "");

    try {
        jwt.verify(accessToken, secretKey);
        const decoded = jwt.decode(accessToken);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "The request was unauthenticated",
        });
    }
}

export default authUser;