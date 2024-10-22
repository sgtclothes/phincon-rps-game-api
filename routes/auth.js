const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require("../controllers/auth");
const { bodyValidationRegister, checkDuplicates } = require("../controllers/validations");

router.post("/register", bodyValidationRegister, checkDuplicates, registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
