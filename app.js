const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const express = require('express')
const app = express()
const config = require('./utils/config.js')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connection to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.json())
morgan.token('reqBody', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :total-time[digits] - :response-time ms :reqBody'))

app.get('/api/blogs', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})


app.post('/api/blogs', (request, response) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (!body.title) {
        return response.status(400).json({
            error: 'title missing'
        })
    } else if (!body.author) {
        return response.status(400).json({
            error: 'author missing'
        })
    } else if (!body.url) {
        return response.status(400).json({
            error: 'url missing'
        })
    } else if (!body.likes) {
        return response.status(400).json({
            error: 'likes missing'
        })
    }

    const blog = new Blog(body)

    blog
        .save()
        .then(result => {
            response.status(201).json(result)
        })
})

app.use(middleware.errorHandler)

module.exports = app
