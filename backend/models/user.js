const mongoose = require ('mongoose')
const bcrypt = require ('bcrypt')

const useSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        minlength : 8,
        required : true
    },
    username : {
        type : String,
        required : true,
        unique : true
    },
    googleId: {
        type: String,
        default: null
    },

    googleEmail: {
        type: String,
        default: null
    },

    googleAccessToken: {
        type: String,
        default: null
    },

    googleRefreshToken: {
        type: String,
        default: null
    },

    gmailConnected: {
        type: Boolean,
        default: false
    }
}, {timestamps : true}) // It automatically adds created at field

useSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
    try {
        this.password = await bcrypt.hash(this.password, 10)
    } catch (err){
        throw err;
    }
});

const User = mongoose.model('User', useSchema)
module.exports = User