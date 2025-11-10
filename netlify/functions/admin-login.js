// netlify/functions/admin-login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../backend/db');

const ADMIN_EMAIL = 'admin@earnapp.com';
const ADMIN_PASS_HASH = '$2a$10$n5M8ghq8KZ21DHnQ0am.b.18U4ZYVjxRjNBKTwQbGmUWOZ3JHYbgS'; // bcrypt of 'admin123'

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  await connectDB();

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid JSON' }) }; }

  const { email, password } = body;

  if (email !== ADMIN_EMAIL) {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Invalid credentials' }) };
  }

  const isMatch = await bcrypt.compare(password, ADMIN_PASS_HASH);
  if (!isMatch) {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Invalid credentials' }) };
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, token, redirect: '/admin.html' })
  };
};