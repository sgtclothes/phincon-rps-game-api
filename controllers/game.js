const { Op } = require("sequelize");
const { Match, User } = require("../models");
const redis = require("./redis");

const validChoices = ["rock", "paper", "scissors"];

const createMatch = async (req, res) => {
    try {
        const { value } = req.body;
        const { userId } = req.cookies;
        let user = await redis.get(`user:${userId}:data`);
        user = JSON.parse(user);
        if (!validChoices.includes(value)) {
            return res.status(500).json({
                status: "failed",
                message: "Invalid value",
                code: 500,
            });
        }
        await Match.create({
            mc_player_one: user.us_id,
            mc_player_one_value: value,
            mc_active: true,
        });
        return res.status(200).json({
            status: "success",
            message: `Match Created! You choose ${value}, waiting for compete with other player`,
            code: 200,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "failed",
            message: error.message,
            code: 500,
        });
    }
};

const getAvailableMatch = async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: { mc_player_two: null, mc_active: true },
            attributes: ["mc_id"],
            include: [
                {
                    model: User,
                    as: "player_one",
                    attributes: ["us_fullname", "us_username"],
                },
            ],
        });
        return res.status(200).json({
            status: "success",
            message: "Successfully get all available match",
            data: matches,
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: "failed",
            message: error.message,
            code: 500,
        });
    }
};

const determineWinner = (playerOneName, playerTwoName, playerOneValue, playerTwoValue) => {
    if (playerOneValue === playerTwoValue) {
        return "Draw!";
    }
    if (
        (playerOneValue === "rock" && playerTwoValue === "scissors") ||
        (playerOneValue === "scissors" && playerTwoValue === "paper") ||
        (playerOneValue === "paper" && playerTwoValue === "rock")
    ) {
        return playerOneName + " win!";
    } else {
        return playerTwoName + " win!";
    }
};

const competeMatch = async (req, res) => {
    try {
        const { id, value } = req.body;
        if (!validChoices.includes(value)) {
            return res.status(500).json({
                status: "failed",
                message: "Invalid value",
                code: 500,
            });
        }
        const { userId } = req.cookies;
        let user = await redis.get(`user:${userId}:data`);
        user = JSON.parse(user);
        const match = await Match.findOne({
            where: { mc_id: id },
            attributes: ["mc_id", "mc_player_one", "mc_player_one_value", "mc_player_two", "mc_player_two_value"],
            include: [
                {
                    model: User,
                    as: "player_one",
                    attributes: ["us_fullname"],
                },
            ],
        });
        if (!match) {
            return res.status(500).json({
                status: "failed",
                message: "Match not found",
                code: 500,
            });
        }
        if (Number(match.mc_player_one) === Number(userId)) {
            return res.status(500).json({
                status: "failed",
                message: "Cannot compete with your own match!",
                code: 500,
            });
        }
        if (match.mc_player_two || match.mc_player_two_value) {
            return res.status(500).json({
                status: "failed",
                message: "Match ended!",
                code: 500,
            });
        }
        await Match.update(
            {
                mc_player_two: user.us_id,
                mc_player_two_value: value,
            },
            { where: { mc_id: id } }
        );
        return res.status(200).json({
            status: "success",
            message: determineWinner(match.player_one.us_fullname, user.us_fullname, match.mc_player_one_value, value),
            code: 200,
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: "failed",
            message: error.message,
            code: 500,
        });
    }
};

const getAllScores = async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: {
                mc_player_one: {
                    [Op.not]: null,
                },
                mc_player_one_value: {
                    [Op.not]: null,
                },
                mc_player_two: {
                    [Op.not]: null,
                },
                mc_player_two_value: {
                    [Op.not]: null,
                },
            },
            attributes: ["mc_player_one", "mc_player_one_value", "mc_player_two", "mc_player_two_value"],
            include: [
                {
                    model: User,
                    as: "player_one",
                    attributes: ["us_username"],
                },
                {
                    model: User,
                    as: "player_two",
                    attributes: ["us_username"],
                },
            ],
        });
        const scores = {};
        matches.map((match) => {
            if (match.mc_player_one_value !== match.mc_player_two_value) {
                if (
                    (match.mc_player_one_value === "rock" && match.mc_player_two_value === "scissors") ||
                    (match.mc_player_one_value === "scissors" && match.mc_player_two_value === "paper") ||
                    (match.mc_player_one_value === "paper" && match.mc_player_two_value === "rock")
                ) {
                    if (!scores[match.player_one.us_username]) {
                        scores[match.player_one.us_username] = 1;
                    } else {
                        scores[match.player_one.us_username] += 1;
                    }
                } else {
                    if (!scores[match.player_two.us_username]) {
                        scores[match.player_two.us_username] = 1;
                    } else {
                        scores[match.player_two.us_username] += 1;
                    }
                }
            }
        });
        return res.status(200).json({
            status: "success",
            message: "Successfully get all scores",
            code: 200,
            data: scores,
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: "failed",
            message: error.message,
            code: 500,
        });
    }
};

module.exports = { createMatch, getAvailableMatch, competeMatch, getAllScores };
