const express = require('express')
const { handleCustomErrors, PSQL400Errors, handleServerErrors } = require('./index')

const { getAllCategories, getReviewById, getReviews, getComments } = require('./controllers/controllers')

const app = express()

// GET
app.get('/api/categories', getAllCategories)
app.get('/api/reviews/:review_id', getReviewById)
app.get('/api/reviews', getReviews)
app.get('/api/reviews/:review_id/comments', getComments)

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