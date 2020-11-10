const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects
      .map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('return the correct amount of blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('unique identifier property of the blog posts is named id ', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })

})


describe('Blog list POST operations', () => {

  test('a valid blog is added', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const urls = response.body.map(r => r.url)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(urls).toContain('http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
  })  
})

afterAll(() => {
  mongoose.connection.close()
})