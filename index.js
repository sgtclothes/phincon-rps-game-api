require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const gameRouter = require("./routes/game");
const cookieParser = require("cookie-parser");
const { Redis } = require("ioredis");

const redis = new Redis({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
    console.log("Redis Connected");
});

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use("/", gameRouter);
app.get("/set-cookie", (req, res) => {
    const options = {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("myCookie", "cookieValue", options);
    res.send("Cookie has been set!");
});

app.get("/get-cookie", (req, res) => {
    const myCookie = req.cookies.myCookie;
    res.send(`Cookie value: ${myCookie}`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
