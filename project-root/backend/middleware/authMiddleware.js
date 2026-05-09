const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get the token from the request header
    const token = req.header('x-auth-token');

    // 2. Check if no token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify the token is real and hasn't expired
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the user info to the request so the next function can use it
        req.user = decoded.user;
        next(); // Tell the server to move on to the next piece of code
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};