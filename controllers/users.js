const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.password === undefined) {
    return response.status(400).json('error: password missing')
  } else if (body.password.length < 3) {
    return response.status(400).json('error: password is shorter than the minimum allowed length (3)')
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  try {
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)
  }
  catch (error) {
    response.status(400).json(error.message)
  }

})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })


  if (users) {
    response.json(users)
  } else {
    response.status(404).end()
  }
})

module.exports = usersRouter