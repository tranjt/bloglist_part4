const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const express = require('express')
const app = express()
const config = require('./utils/config.js')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')


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

app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)


app.use(middleware.errorHandler)

module.exports = app
