const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body) {
    return response.status(400).json({ error: 'content missing' })
  } else if (!body.title) {
    return response.status(400).json({ error: 'title missing' })
  } else if (!body.author) {
    return response.status(400).json({ error: 'author missing' })
  } else if (!body.url) {
    return response.status(400).json({ error: 'url missing' })
  } else if (!request.token) {
    return response.status(400).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(request.token, process.env.TOKEN_SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token is invalid' })
  }

  if (!body.likes) { Object.assign(body, { likes: 0 }) }

  const user = await User.findById(decodedToken.id)
  Object.assign(body, { user: user })

  const blog = new Blog(body)

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {

  //remove blog id saved in user blogs array when delete a blog
  const blog = await Blog.findById(request.params.id)
  const user = await User.findById(blog.user._id)
  await user.blogs.pull(request.params.id)
  user.save()

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog.toJSON())
})


module.exports = blogsRouter