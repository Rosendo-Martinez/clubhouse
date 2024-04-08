const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, minLength: 2 },
    body: { type: String, required: true, minLength: 10 },
    post_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
