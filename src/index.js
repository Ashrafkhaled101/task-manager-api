const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
require('./db/mongoose')


const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRouter) // users routes
app.use(taskRouter) // tasks router

app.listen(port, () => {
    console.log('server is up on port', port );
})


