const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})


blogsRouter.post('/', (request, response) => {
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

module.exports = blogsRouter