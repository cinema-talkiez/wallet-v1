// netlify/functions/request-withdrawal.js
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const WithdrawalRequest = require('../../backend/models/WithdrawalRequest');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method Not Allowed' }) };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Unauthorized' }) };
  }

  const token = authHeader.split(' ')[1];
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Invalid token' }) };
  }

  await connectDB();

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid JSON' }) };
  }

  const { amount, upiId } = body;

  if (!amount || amount < 10) {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Minimum withdrawal is $10' }) };
  }
  if (!upiId || !upiId.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Valid UPI ID required' }) };
  }

  try {
    const user = await User.findById(userId);
    
    // FIXED LINE: Added parentheses around !user
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ msg: 'User not found' }) };
    }

    if (user.wallet < amount) {
      return { statusCode: 400, body: JSON.stringify({ msg: 'Insufficient balance' }) };
    }

    // DEDUCT IMMEDIATELY
    user.wallet -= amount;
    await user.save();

    const request = new WithdrawalRequest({
      userId: user._id,
      amount,
      upiId,
      status: 'pending'
    });
    await request.save();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Amount deducted. Request submitted!',
        newBalance: user.wallet,
        requestId: request._id
      })
    };
  } catch (err) {
    console.error('Withdrawal error:', err);
    return { statusCode: 500, body: JSON.stringify({ msg: 'Server error' }) };
  }
};