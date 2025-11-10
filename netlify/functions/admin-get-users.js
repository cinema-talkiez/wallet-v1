// netlify/functions/admin-get-users.js
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const auth = event.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return { statusCode: 401 };

  try { jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET); }
  catch { return { statusCode: 401 }; }

  await connectDB();

  try {
    const users = await User.find().select('name email userid wallet createdAt');
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    };
  } catch {
    return { statusCode: 500 };
  }
};