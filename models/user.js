const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);
