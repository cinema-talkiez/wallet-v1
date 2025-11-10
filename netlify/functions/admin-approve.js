// netlify/functions/admin-approve.js
const WithdrawalRequest = require('../../backend/models/WithdrawalRequest');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  await connectDB();

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400 }; }

  const { requestId } = body;

  try {
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid request' }) };
    }

    request.status = 'success';
    request.processedAt = new Date();
    await request.save();

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500 };
  }
};