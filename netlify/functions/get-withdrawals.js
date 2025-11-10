const jwt = require('jsonwebtoken');
const WithdrawalRequest = require('../../backend/models/WithdrawalRequest');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
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

  try {
    const requests = await WithdrawalRequest.find({ userId }).sort({ requestedAt: -1 });
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
