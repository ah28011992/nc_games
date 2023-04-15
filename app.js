const express = require('express')
const { handleCustomErrors, PSQL400Errors, handleServerErrors } = require('./index')
const { getAllCategories, getReviewById, getReviews, getComments, postComments, patchVotes, deleteComment } = require('./controllers/controllers')

const cors = require('cors');


const app = express()
app.use(express.json())
app.use(cors());

// GET
app.get('/api/categories', getAllCategories)
app.get('/api/reviews/:review_id', getReviewById)
app.get('/api/reviews', getReviews)
app.get('/api/reviews/:review_id/comments', getComments)
app.post('/api/reviews/:review_id/comments', postComments)
app.patch('/api/reviews/:review_id', patchVotes)
app.delete('/api/comments/:comment_id', deleteComment)


// Post 


// MW

app.all('*', (req, res) => {

  res.status(404).send({ msg: 'Not found' })
})

app.all('*', (req, res) => {
  res.status(400).send({ msg: 'Bad request' })
})



// Error handlers
app.use(handleCustomErrors)
app.use(PSQL400Errors)
app.use(handleServerErrors)


module.exports = app