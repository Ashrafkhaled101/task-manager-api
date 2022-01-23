const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) throw new Error('you must enter a valid email')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        validate(value) {
            if(value.toLowerCase().includes('password')) throw new Error('your password can not be password :D ')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if (value < 0) throw new Error('Age must be positive number')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
    
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// userSchema.set('toObject', { virtuals: true });
// userSchema.set('toJSON', { virtuals: true });

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jsonwebtoken.sign({_id: this._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token

}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})

    if (!user) throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) throw new Error('Unable to login')

    return user
}

userSchema.methods.toJSON = function () {

    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// Hash the plain text password
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }


    next()
})

// Delete user tasks when user is removed

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id})
    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User