import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Denied. Invalid token format." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Attach decoded user payload (userId) to request object
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default authMiddleware;
