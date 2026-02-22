const jwt = require('jsonwebtoken');

// Generate JWT token and set cookie
const generateTokenAndSetCookie = (userId, res) => {
    // Create JWT token with 7 days expiration
    const token = jwt.sign(
        { userId }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '7d' }
    );

    // Set cookie with 7 days expiration
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return token;
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    } catch (error) {
        return null;
    }
};

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.userId = decoded.userId;
    next();
};

module.exports = {
    generateTokenAndSetCookie,
    verifyToken,
    authenticateToken
};