
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const TOKENSECRET = process.env.TOKENSECRET;

const generateToken = (user) => {
    const token = jwt.sign(
        { id: user._id },
        TOKENSECRET,
        { expiresIn: "3d" }
    )
    return token;
}

const protectRoute = asyncHandler(async (req, res, next) => {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ msg: "Not authorized." })
    }
    try {
        const decoded = jwt.verify(token, TOKENSECRET);
        const user = await userModel.findOne({ _id: decoded.id });
        if (!user) {
            return res.status(404).json({ msg: "No user found." })
        }
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;

        if (timeLeft < 60 * 60 * 24) {
            
            const newToken = generateToken({ id: decoded.id });
            res.cookie("token",newToken, {httpOnly:true, secure:process.env.NODE_ENV === 'production', sameSite:"strict"});
        }
        req.user = user;
        next()
    } catch (err) {
        if (err.name == "TokenExpiredError") return res.status(401).json({ msg: "Token expired." })
        return res.status(403).json({ msg: "Invalid token." })
    }

})

const protectRouteLoose = asyncHandler(async (req, res, next) => {

    const token = req.cookies.token;
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, TOKENSECRET);
        const user = await userModel.findOne({ _id: decoded.id });
        if (!user) {
            return next();
        }
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;

        if (timeLeft < 60 * 60 * 24) {
            
            const newToken = generateToken({ id: decoded.id });
            res.cookie("token",newToken, {httpOnly:true, secure:process.env.NODE_ENV === 'production', sameSite:"strict"});
        }
        req.user = user;
        next()
    } catch (err) {
        return next();
    }

})

export { generateToken, protectRoute, protectRouteLoose };