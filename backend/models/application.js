const mongoose = require ('mongoose')

const useSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    companyName : {
        type : String,
        required : true,
    },
    jobRole : {
        type : String,
        required : true
    },
    jobDescription : {
        type : String,
        maxlength : 5000
    },
    appliedAt : {
        type : Date,
        required : true,
    },
    jobStatus : {
        type : String,
        enum : ['Saved', 'In Progress', 'Interviewing', 'Offer', 'Accepted', 'Rejected'],
        default : 'Applied',
        required : true
    },
    jobSaved : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})

const Application = mongoose.model('Application', useSchema)
module.exports = Application