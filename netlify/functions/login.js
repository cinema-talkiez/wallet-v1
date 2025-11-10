const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method Not Allowed' }) };
  }

  await connectDB();

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid JSON' }) };
  }

  const { email, password } = body;

  try {
    const user = await User.findOne({ email });
    if (!user) return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid credentials' }) };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid credentials' }) };

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        token,
        redirect: '/dashboard.html',
        user: {
          name: user.name,
          email: user.email,
          userid: user.userid,
          wallet: user.wallet
        }
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
