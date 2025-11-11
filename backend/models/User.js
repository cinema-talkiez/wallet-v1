// backend/models/User.js
// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  userid: { 
    type: String, 
    required: true,
    unique: true 
  },
  wallet: { 
    type: Number, 
    default: 0 
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
}, {
  timestamps: true
});

// AUTO-GENERATE userid IF NOT PROVIDED
userSchema.pre('save', function(next) {
  if (!this.userid) {
    this.userid = 'UID' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 99);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
