const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};

module.exports = generateToken;