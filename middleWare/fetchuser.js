const jwt = require("jsonwebtoken");

let JWT_SECRET = process.env.JWT_SECRET
const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    // const token = req.headers.authorization;
    if (!token) return res.json({ message: "Access Denied. No token found" });
    try {
        const data = jwt.verify(token, JWT_SECRET);
        // console.log(data);
        req.user = data.id;
        next();
    } catch (error) {
        return res.json({ message: "Access Denied. No token found" });
    }
}

module.exports = fetchuser;