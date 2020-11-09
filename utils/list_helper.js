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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}