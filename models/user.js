const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Post = require("./post");

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

UserSchema.virtual('join_date_formatted').get(function() {
    return DateTime.fromJSDate(this.join_date).toLocaleString(DateTime.DATE_MED);
})

UserSchema.methods.canMakePost = function() {
    return this.isTrusted;
}

UserSchema.methods.createPost = function(title, body) {
    if (!this.canMakePost()) {
        throw new Error("This user is not allowed to make posts.");
    }

    return new Post({
        author: this._id,
        title: title,
        body: body,
    });
}

module.exports = mongoose.model("User", UserSchema);
