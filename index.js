require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const authRouter = require("./routes/auth");
const gameRouter = require("./routes/game");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use("/auth", authRouter);
app.use("/", gameRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
