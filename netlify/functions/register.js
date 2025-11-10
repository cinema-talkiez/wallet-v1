const bcrypt = require('bcryptjs');
const connectDB = require('../../backend/db');
const User = require('../../backend/models/User');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password, name } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password required' }),
      };
    }

    // ✅ Wait for DB to be connected before querying
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Email already registered' }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Registered successfully!',
        redirect: '/index.html',
      }),
    };
  } catch (err) {
    console.error('Registration Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    };
  }
};
