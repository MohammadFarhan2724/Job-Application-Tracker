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
    }
}, {timestamps : true}) // It automatically adds created at field

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', useSchema)
module.exports = User