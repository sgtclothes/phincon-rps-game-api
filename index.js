require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const gameRouter = require("./routes/game");
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
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use("/", gameRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
