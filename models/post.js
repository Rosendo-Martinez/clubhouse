const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, minLength: 2 },
    body: { type: String, required: true, minLength: 10 },
    post_date: { type: Date, default: Date.now },
});

PostSchema.virtual('url').get(function() {
    return `/clubhouse/posts/${this._id}`;
})

PostSchema.virtual('post_date_formatted').get(function() {
    return DateTime.fromJSDate(this.post_date).toLocaleString(DateTime.DATE_MED);
})

PostSchema.methods.getRelativePostDate = function() {
    return DateTime.fromJSDate(this.post_date).toRelative();
}

PostSchema.methods.getTruncatedBody = function() {
    const maxCharacters = 50;

    if (this.body.length <= maxCharacters) {
        return this.body;
    }

    return this.body.slice(0, maxCharacters) + "...";
}

PostSchema.methods.getTruncatedTitle = function() {
    const maxCharacters = 30;

    if (this.title.length <= maxCharacters) {
        return this.title;
    }

    return this.title.slice(0, maxCharacters) + "...";
}

module.exports = mongoose.model("Post", PostSchema);
