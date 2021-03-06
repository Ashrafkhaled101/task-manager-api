const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// creating new task
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task (req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)

    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    
    const allowedUpdates = ['completed', 'description']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send('invalid update param')
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        //const task = await Task.findById(req.params.id)
        if (!task) return res.status(404).send('task not found')

        updates.forEach(update => task[update] = req.body[update]);
        await task.save()

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})


        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
    
})


// featching all tasks
// GET/tasks?completed=false
// limit - skip
// GET/tasks?limit=10&skip=limit*(page# - 1)
// GET/tasks?sortBy=createdAt_asc/createdAt_desc
router.get('/tasks', auth, async (req, res) => {

    try {
        //const tasks  = await Task.find({owner: req.user._id})
        
        const match = {}
        const sort = {}
        if (req.query.completed) match.completed = req.query.completed === 'true'

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split('_')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(404).send(e)
    }
})

// fetching a tasks by id
router.get('/tasks/:id' , auth, async (req, res) => {

    try {
        //const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task) return res.status(404).send('404: task not found')

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//deleting a task by id
router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send('task not found')

        res.send(task)

    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router