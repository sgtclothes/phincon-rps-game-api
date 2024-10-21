const { User, Token, UserRole, Role, Profile } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { Navigator } = require("node-navigator");
const { getClientIP } = require("./helper");
const { generateToken } = require("./token");
const redis = require("./redis");

const registerUser = async (req, res) => {
    try {
        const { fullname, username, email, phoneNumber, password } = req.body;
        const newUser = await User.create({
            us_fullname: fullname,
            us_username: username,
            us_email: email,
            us_phone_number: phoneNumber,
            us_password: await bcrypt.hash(password, 10),
            us_active: false,
        });
        const verificationToken = generateToken(newUser.us_id, newUser.us_email, process.env.JWT_EXPIRES_IN);
        await Token.create({
            tkn_type: "REGISTER",
            tkn_value: verificationToken,
            tkn_description: `Register token user created and sent to ${email}`,
            tkn_client_ip: (await getClientIP()).ip,
            tkn_client_agent: new Navigator().userAgent,
            tkn_us_id: newUser.us_id,
            tkn_expired_on: new Date(new Date().getTime() + 60 * 60 * 1000),
            tkn_active: true,
            tkn_created_on: new Date(),
            tkn_created_by: newUser.us_id,
        });
        await UserRole.create({
            ur_us_id: newUser.us_id,
            ur_rl_id: 3,
            ur_active: true,
        });
        await Profile.create({
            pr_us_id: newUser.us_id,
            pr_gender: "male",
            pr_description: null,
            pr_address: null,
            pr_active: true,
        });
        delete newUser.dataValues.us_password;
        return res.status(201).json({
            code: 201,
            message: "User registered successfully!",
            data: newUser,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error registering user", error: error, code: 500 });
    }
};
const loginUser = async (req, res) => {
    try {
        const { input, password, rememberMe } = req.body;
        const user = await User.findOne({
            where: {
                [Op.or]: [{ us_username: input }, { us_email: input }, { us_phone_number: input }],
            },
            attributes: [
                "us_username",
                "us_id",
                "us_email",
                "us_fullname",
                "us_phone_number",
                "us_password",
                "us_active",
            ],
            include: [
                {
                    model: Role,
                    as: "roles",
                    attributes: ["rl_code"],
                    through: { attributes: [] },
                },
            ],
        });
        if (!user) {
            return res.status(400).json({ status: "failed", code: 400, message: "User not found" });
        }
        if (!user.us_active) {
            return res
                .status(400)
                .json({ status: "failed", code: 400, message: "User is not active, please contact administrator" });
        }
        const isMatch = await bcrypt.compare(password, user.us_password);
        if (!isMatch) {
            return res.status(400).json({ status: "failed", code: 400, message: "Invalid Password" });
        }
        let milliseconds = 24 * 60 * 60 * 1000;
        if (rememberMe) {
            milliseconds = milliseconds * 30;
        }
        let seconds = milliseconds / 1000;
        let expiresIn = new Date(Date.now() + milliseconds);
        const loginToken = generateToken(user.us_id, user.us_email, "1d");
        await Token.create({
            tkn_type: "LOGIN",
            tkn_value: loginToken,
            tkn_description: `Login token user created with user ${input}`,
            tkn_client_ip: (await getClientIP()).ip,
            tkn_client_agent: new Navigator().userAgent,
            tkn_us_id: user.us_id,
            tkn_expired_on: expiresIn,
            tkn_active: true,
            tkn_created_on: new Date(),
            tkn_created_by: user.us_id,
        });
        delete user.dataValues.us_password;
        user.dataValues.token = loginToken;
        await redis.set("user", JSON.stringify(user), "EX", seconds);
        return res.status(200).send({
            code: 200,
            message: "User successfully logged in!",
        });
    } catch (error) {
        return res.status(500).json({ message: "Error login", error: error, code: 500 });
    }
};

const logoutUser = async (req, res) => {
    try {
        const user = await redis.get("user");
        if (user) {
            const { token } = JSON.parse(user);
            await Token.update({ tkn_active: false }, { where: { tkn_value: token } });
        }
        await redis.del("user");
        return res.status(200).send({
            code: 200,
            message: "User successfully logged out!",
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({ message: "Error login", error: error, code: 500 });
    }
};

module.exports = { registerUser, loginUser, logoutUser };
