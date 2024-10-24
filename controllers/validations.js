const Joi = require("joi");
const { User } = require("../models");
const redis = require("./redis");
const jwt = require("jsonwebtoken");

const checkLoginUser = async (req, res, next) => {
    const { userId } = req.cookies;
    const user = await redis.get(`user:${userId}:data`);
    if (!user) {
        return res.status(400).json({
            code: 401,
            message: "Please login first",
            status: "failed",
        });
    }
    const token = JSON.parse(user).token;
    if (!token) {
        return res.status(401).json({ code: 401, message: "Token not found", status: "failed" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ code: 401, message: "Invalid Token", status: "failed" });
        }
        next();
    });
};

const validateRegisterUser = (req) => {
    const schema = Joi.object({
        fullname: Joi.string().min(5).max(20).required(),
        username: Joi.string().min(5).max(10).required(),
        phoneNumber: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string()
            .min(8)
            .max(30)
            .pattern(/(?=.*[a-z])/)
            .pattern(/(?=.*[A-Z])/)
            .pattern(/(?=.*[0-9])/)
            .pattern(/(?=.*[!@#$%^&*])/)
            .required(),
    });
    const validationError = schema.validate(req.body).error;
    return validationError;
};

const bodyValidationRegister = (req, res, next) => {
    const validation = validateRegisterUser(req);
    if (validation) {
        return res.status(400).send({
            status: "failed",
            code: 400,
            details: validation.details,
        });
    }
    next();
};

const checkDuplicates = async (req, res, next) => {
    try {
        const { email, username } = req.body;
        const emailExists = await User.findOne({
            where: { us_email: email },
        });
        if (emailExists) {
            return res.status(400).json({
                status: "failed",
                code: 400,
                message: "Email already in use",
            });
        }
        const usernameExists = await User.findOne({
            where: { us_username: username },
        });
        if (usernameExists) {
            return res.status(400).json({
                status: "failed",
                code: 400,
                message: "Username already in use",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { bodyValidationRegister, checkDuplicates, validateRegisterUser, checkLoginUser };
