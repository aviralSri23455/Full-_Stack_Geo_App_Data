// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, { 
    timestamps: true 
});

// Index for email lookups
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);