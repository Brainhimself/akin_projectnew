const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({ error: 'Invalid token' });
    }
};

module.exports = authenticate;
