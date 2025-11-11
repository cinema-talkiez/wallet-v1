// netlify/functions/register.js
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
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false }) };

  try {
    await connectDB();
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Database connection failed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid JSON' }) };
  }

  let { name, email, password } = body;

  // FIX 1: Proper validation
  if (!name || name.trim().length < 2) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Name is required and must be at least 2 characters' }) };
  }
  if (!email || !password) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Email and password are required' }) };
  }
  if (password.length < 6) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }) };
  }

  name = name.trim();
  email = email.toLowerCase().trim();

  try {
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Email already registered' }) };
    }

    // Generate unique userid
    const userid = 'UID' + Date.now().toString().slice(-8);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
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
        user: {
          name: user.name,
          email: user.email,
          userid: user.userid,
          wallet: user.wallet
        }
      })
    };

  } catch (err) {
    console.error('Register error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Registration failed. Please try again.' }) };
  }
};
