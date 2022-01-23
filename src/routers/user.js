const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sencCancleEmail} = require('../emails/account')
const router = new express.Router()

// creating a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }

})

// updating user info
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        
        res.send({user,token})

    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth , async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })

        await req.user.save()

        res.status(200).send()
    } catch (e) {
        res.status(500).send(e)
    }
})


router.post('/users/logoutAll', auth , async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

// updating user by id

router.patch('/users/me', auth ,async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','age','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send('error: invalid update')

    try {

        //const user = await User.findById(req.user._id)
        
        updates.forEach( update => req.user[update] = req.body[update] );

        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        //if(!user) return res.status(404).send('user not found')

        res.send(req.user)

    } catch (e) {
        res.status(400).send(e)
    }
})

// fetching the user
router.get('/users/me' , auth , async (req, res) => {

    res.send(req.user)
})

// delete account 
router.delete('/users/me', auth ,async(req, res) => {
    try {
        
        sencCancleEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)

    } catch (e) {
        res.status(400).send()
    }
})

// avatar upload handler

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i))
            return cb(new Error('unsupported format, please upload an image'))
        
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
   
    const buffer = await sharp(req.file.buffer).png().resize({width:250, height:250}).toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//fetching the img
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)


    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router