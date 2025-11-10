const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ loggedIn: false })
    };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return { statusCode: 401, body: JSON.stringify({ loggedIn: false }) };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loggedIn: true,
        user: {
          name: user.name,
          email: user.email,
          userid: user.userid,
          wallet: user.wallet
        }
      })
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ loggedIn: false }) };
  }
};
