// netlify/functions/auto-credit.js
// netlify/functions/auto-credit.js
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  // === 1. Extract & Verify JWT ===
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'No token provided' }) };
  }

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Invalid or expired token' }) };
  }

  // === 2. Parse Request Body ===
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
  }

  const { userId, amount } = body;

  // === 3. Security: Match userId from token ===
  if (userId !== payload.id) {
    return { statusCode: 403, headers, body: JSON.stringify({ success: false, message: 'Unauthorized: user ID mismatch' }) };
  }

  if (!amount || amount !== 10) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid amount' }) };
  }

  try {
    await connectDB();

    // === 4. Update Wallet in MongoDB ===
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: amount } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'User not found' }) };
    }

    // === 5. Success Response ===
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '₹10 credited successfully',
        newBalance: updatedUser.wallet
      })
    };

  } catch (err) {
    console.error('Auto-credit error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
