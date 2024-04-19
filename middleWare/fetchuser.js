const jwt = require("jsonwebtoken");

let JWT_SECRET = 'vortex$your_point@to!a-new%world^'
const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    // const token = req.headers.authorization;
    if (!token) return res.json({ message: "Access Denied. No token found" });
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.id;
        next();
    } catch (error) {
        return res.json({ message: "Access Denied. No token found" });
    }
}

module.exports = fetchuser;