const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const whiteboardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    canvasState: { type: String }, // New field to store canvas state
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


// Password hashing middleware.
userSchema.pre('save', function(next) {
    if (this.isModified('password') || this.isNew) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

// Helper method to validate user's password.
userSchema.methods.comparePassword = function(pw, cb) {
    bcrypt.compare(pw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const User = mongoose.model('User', userSchema);
const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);

module.exports = { User, Whiteboard };
