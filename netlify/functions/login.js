// netlify/functions/login.js
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

  try {
    await connectDB();
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'DB connection failed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } 
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { email, password } = body;
  if (!email || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
    }

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
    console.error('Login Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
