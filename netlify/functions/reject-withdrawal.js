const User = require('../../backend/models/User');
const WithdrawalRequest = require('../../backend/models/WithdrawalRequest');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  await connectDB();

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { requestId } = body;

  try {
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return { statusCode: 400, body: 'Invalid or already processed request' };
    }

    // REFUND
    await User.findByIdAndUpdate(request.userId, { $inc: { wallet: request.amount } });

    request.status = 'rejected';
    request.processedAt = new Date();
    await request.save();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, refunded: true })
    };
  } catch (err) {
    return { statusCode: 500, body: 'Server error' };
  }
};
