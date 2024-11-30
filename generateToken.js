const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// User ID for token payload
const userId = 'exampleUserId123';

const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

console.log('Generated Token:', token);
