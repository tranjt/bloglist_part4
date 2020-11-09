const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}


function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

const favoriteBlog = (blogs) => {
  let topBlog = {}

  blogs.forEach(blog => {
    if (isEmpty(topBlog)) topBlog = blog
    else if (topBlog.likes < blog.likes) topBlog = blog
  })

  return {
    title: topBlog.title,
    author: topBlog.author,
    likes: topBlog.likes
  }
}

const mostBlogs = (blogs) => {
  const authorArray = _.map(blogs, 'author')
  const authorBlogsCount = _.countBy(authorArray)
  const mostBlogsAuthor = _.chain(authorBlogsCount).keys().sort().last().value()

  return {
    author: mostBlogsAuthor,
    count: authorBlogsCount[mostBlogsAuthor]
  }
}

const mostLikes = (blogs) => {

  const authorTotalLikes = _(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      'author': key,
      'likes': _.sumBy(objs, 'likes')
    }))
    .value()

  return _.maxBy(authorTotalLikes, 'likes')
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}