const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('User api operations', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const userObjects = helper.initialUsers[0]
    await api
      .post('/api/users')
      .send(userObjects)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('return the correct amount of users', async () => {
    const response = await api.get('/api/users')
    expect(response.body.length).toBe(helper.initialUsers.length)
  })

  test('server response 400 Bad Request if not unique username', async () => {
    const newUserNotUnique = {
      'username': 'root',
      'name': 'admin',
      'password': 'sekret'
    }

    const response = await api
      .post('/api/users')
      .send(newUserNotUnique)
      .expect(400)

    expect(response.body).toContain('User validation failed: username: Error, expected `username` to be unique.')
  })

  test('server response 400 Bad Request if username not at least 3 characters long ', async () => {
    const newUser = {
      'username': 'ro',
      'name': 'admin',
      'password': 'sekret'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(response.body).toContain('is shorter than the minimum allowed length (3)')
  })

  test('server response 400 Bad Request if password not at least 3 characters long ', async () => {
    const newUser = {
      'username': 'root',
      'name': 'admin',
      'password': 'se'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(response.body).toContain('is shorter than the minimum allowed length (3)')
  })
})


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
  let token = ''

  beforeEach(async () => {
    const response = await api
      .post('/api/login')
      .send({
        'username': 'root',
        'password': 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    token = response.body.token
  })

  test('a valid blog is added', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(helper.newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const urls = response.body.map(r => r.url)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(urls).toContain('http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
  })

  test('if likes property is missing default value 0', async () => {
    const newBlogNoLikes = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlogNoLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const latestBlogIndex = response.body.length - 1

    expect(response.body[latestBlogIndex].likes).toBe(0)
  })

  test('if the title and url properties missing, server response 400 Bad Request', async () => {
    const newBlogNoTitle = {
      'author': 'Jumppapallo',
      'url': 'http://Gymnast.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlogNoTitle)
      .expect(400)

    const newBlogNoURL = {
      'title': 'Rankine pompa',
      'author': 'Hiina',
    }

    await api
      .post('/api/blogs')
      .send(newBlogNoURL)
      .expect(400)
  })

  test('status code 401 Unauthorized if a token is not provided', async () => {
    await api
      .post('/api/blogs')
      .send(helper.newBlog)
      .expect(401)
  })

})


afterAll(() => {
  mongoose.connection.close()
})