// netlify/functions/admin-get-requests.js
const jwt = require('jsonwebtoken');
const WithdrawalRequest = require('../../backend/models/WithdrawalRequest');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const auth = event.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return { statusCode: 401, body: JSON.stringify({ msg: 'Unauthorized' }) };

  try {
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Invalid token' }) };
  }

  await connectDB();

  try {
    const requests = await WithdrawalRequest.find().sort({ requestedAt: -1 });
    const populated = await Promise.all(requests.map(async (req) => {
      const user = await User.findById(req.userId).select('name email userid');
      return {
        ...req.toObject(),
        user: user ? { name: user.name, email: user.email, userid: user.userid } : null
      };
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: populated })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: 'Server error' }) };
  }
};