// netlify/functions/register.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const connectDB = require('../../backend/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  await connectDB();

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, password } = body;

  // THIS IS THE FIX — PROPER VALIDATION
  if (!name || name.trim().length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name is required' }) };
  }
  if (!email || !password) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) };
  }
  if (password.length < 6) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) };
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'User already exists' }) };
    }

    const userid = 'UID' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 99);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userid
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, userid: user.userid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        redirect: '/dashboard.html',
        user: { name: user.name, email: user.email, userid: user.userid, wallet: user.wallet }
      })
    };

  } catch (err) {
    console.error('Registration error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Registration failed' }) };
  }
};
