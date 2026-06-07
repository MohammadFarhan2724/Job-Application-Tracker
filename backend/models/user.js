const mongoose = require ('mongoose')


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
    }
}, {timestamps : true}) // It automatically adds created at field

const User = mongoose.model('User', useSchema)
module.exports = User