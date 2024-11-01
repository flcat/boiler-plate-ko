const express = require('express')
const app = express()
const port = 5500

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://flcatxd:1234@boiler-plate.2jwrx.mongodb.net/?retryWrites=true&w=majority&appName=boiler-plate').then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))




app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}`))