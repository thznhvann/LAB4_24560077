const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        age: { type: Number, min: 1, max: 150 },
        gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        type: { type: String, enum: ['normal', 'admin'], default: 'normal' },
        avatarUrl: { type: String, default: '' }
    },
    { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
    return {
        _id: this._id,
        fullName: this.fullName,
        age: this.age,
        gender: this.gender,
        email: this.email,
        type: this.type,
        avatarUrl: this.avatarUrl
    };
};

module.exports = mongoose.model('User', userSchema);