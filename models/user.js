const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema ({
    email:{
        type:String,
        required: true,
    },

    isHost:{
        type:Boolean,
        default:false,
    },
    HostSince:{
        type:Date,
    },
});

userSchema.plugin(passportLocalMongoose, {
    limitAttempts: true,
    maxAttempts: 5,
    timeout: 30 * 1000,
});

module.exports = mongoose.model("User", userSchema);