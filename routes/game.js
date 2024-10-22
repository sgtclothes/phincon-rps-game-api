const express = require("express");
const router = express.Router();
const { createMatch, getAvailableMatch, competeMatch, getAllScores } = require("../controllers/game");
const { checkLoginUser } = require("../controllers/validations");

router.post("/createMatch", checkLoginUser, createMatch);
router.get("/getAvailableMatch", checkLoginUser, getAvailableMatch);
router.post("/competeMatch", checkLoginUser, competeMatch);
router.get("/getAllScores", checkLoginUser, getAllScores);

module.exports = router;