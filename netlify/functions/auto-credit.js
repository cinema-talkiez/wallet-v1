// netlify/functions/auto-credit.js
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'No token' }) };
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Invalid token' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
  }

  const { userId, amount } = body;

  // Security: Ensure userId matches token
  if (userId !== payload.id) {
    return { statusCode: 403, headers, body: JSON.stringify({ success: false, message: 'Unauthorized' }) };
  }

  try {
    await connectDB();

    // Optional: Prevent multiple credits (uncomment if needed)
    // const user = await User.findById(userId);
    // if (user.hasClaimedDestinationBonus) {
    //   return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'Already claimed' }) };
    // }

    const result = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { wallet: amount }
        // $set: { hasClaimedDestinationBonus: true }  // ← uncomment for one-time only
      },
      { new: true }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        newBalance: result.wallet 
      })
    };

  } catch (err) {
    console.error('Auto credit error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
