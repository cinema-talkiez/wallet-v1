// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({


  name: { type: String, required: true },
  userid: { type: String, unique: true },
  wallet: { type: Number, default: 0 },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, {
  timestamps: true,
  // Prevent Mongoose from creating extra indexes
  autoIndex: true
});

// Explicitly prevent `userid` field
userSchema.pre('save', function (next) {
  this.set('userid', undefined);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
