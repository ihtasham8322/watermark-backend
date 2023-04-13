const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    uploadType: {
        type: String,
        enum: ["NOW", "LATER"],
    },
    uploadDate: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    platforms: [
        {
            type: String,
            enum: [
                "FACEBOOK",
                "INSTAGRAM",
                "TWITTER",
                "LINKEDIN",
            ]
        }
    ]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;