const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, minLength: 3, maxLength: 12},
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    description: { type: String },
    join_date: { type: Date, default: Date.now },
    isTrusted: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    iconCharacters: { type: String, required: true, minLength: 1, maxLength: 2 },
    iconColor: { type: String, required: true }
});

UserSchema.virtual('url').get(function() {
    return `/clubhouse/users/${this._id}`;
});

module.exports = mongoose.model("User", UserSchema);
