// backend/db.js
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ quiet: true });
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing in environment variables');

  if (!cached.promise) {
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // ⬆️ Increased from 8000
      connectTimeoutMS: 20000,
      maxPoolSize: 5,
      bufferCommands: false
    }).then((mongoose) => {
      console.log('MongoDB CONNECTED ✅');
      cached.conn = mongoose.connection;
      return cached.conn;
    }).catch((err) => {
      console.error('MongoDB CONNECTION FAILED ❌:', err.message);
      cached.promise = null;
      throw err;
    });
  }

  // ⏳ Ensure connection ready before returning
  await cached.promise;
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection not ready');
  }
  return mongoose.connection;
};

module.exports = connectDB;
