const express = require("express");
const router = express.Router();

router.get("/game", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Success get data",
        code: 200,
    });
});

module.exports = router;