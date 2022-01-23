const mongoose = require('mongoose')

const taskScehma = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})

taskScehma.pre('save' , async function (next) {
    // do sth before saving

    next()
})


const Task = mongoose.model('Task', taskScehma)

module.exports = Task