const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
    },
    dob: {
        type: String,
    },
    qualification: {
        type: String,
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Editor: Number,
        Admin: Number
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: [String],
    brandDetails: {
        website: String,
        email: String,
        phone: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        logo: String,
    },
    billingDetails: {
        companyName: String,
        gstin: String,
        pan: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
    },
    credits: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema);