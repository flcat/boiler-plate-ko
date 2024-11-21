const express = require('express')
const app = express()
const port = 5500

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const config = require('./config/key')

const { User } = require('./models/User')

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))




app.get('/', (req, res) => res.send('Hello World! 안녕하십니까 허허허'))

app.post('/register', async (request, response) => {
    const user = new User(request.body)
    await user.save().then(() => {
        response.status(200).json({ success: true })
    }).catch(err => response.json({ success: false, err }))
})

app.listen(port, () => console.log(`Example app listening on port ${port}`))