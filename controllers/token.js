const jwt = require("jsonwebtoken");

const columns = {
    id: "us_id",
    email: "us_email",
    active: "us_active",
};

const generateToken = (id, email, expiresIn) => {
    const token = jwt.sign({ [columns.id]: id, [columns.email]: email }, process.env.JWT_SECRET, {
        expiresIn: expiresIn,
    });
    return token;
};

module.exports = { generateToken };
