const { fetchAllCategories, getReviewById, selectReviewById, selectAllReviews, selectComments, addComments, addCommentByReviewId, updateVotes, deleteComment, selectComment, fetchUsers } = require('../models/models')
//1. '/api/categories'
exports.getAllCategories = (req, res, next) => {
    fetchAllCategories()
        .then((categories) => {

            res.status(200).send(categories);

        })
        .catch((err) => {
            next(err)
        })


}

//2. /api/reviews /: review_id
exports.getReviewById = (req, res, next) => {
    const { review_id } = req.params;
    selectReviewById(review_id)
        .then((review) => {
            res.status(200).send({ review });
        })
        .catch((err) => {
            next(err);
        });
};



//3. /api/reviews', 

exports.getReviews = (req, res, next) => {
    const { sort_by, order, category } = req.query;
    selectAllReviews(sort_by, order, category).then((reviews) => {
        res.status(200).send({ reviews });
    })
        .catch((err) => {
            next(err);
        });
};
//GET
// 4. /api/reviews/:review_id/comments

exports.getComments = (req, res, next) => {
    const { review_id } = req.params;
    const commentsResult = selectComments(review_id)
    const validArtcleId = selectReviewById(review_id)
    Promise.all([commentsResult, validArtcleId])
        .then(([response]) => {

            res.status(200).send({ comments: response });
        })
        .catch((err) => {
            next(err)
        });
}


// POST 
// /api/reviews /: review_id / comments

exports.postComments = (req, res, next) => {
    const { review_id } = req.params;
    const { username, body } = req.body;
    addComments(review_id, username, body)
        .then((response) => {
            res.status(201).send({ comment: response });
        })
        .catch((err) => {
            if (err.status === 404) {
                res.status(404).send({ msg: err.msg });
            } else {
                next(err);
            }
        });
};
exports.patchVotes = (req, res, next) => {
    const { review_id } = req.params;
    const { inc_votes } = req.body;
    updateVotes(review_id, inc_votes)
        .then((response) => {
            res.status(200).send({ updated_review: response });
        })
        .catch((err) => next(err));
};

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params;
    selectComment(comment_id)
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => next(err));
};

exports.getUsers = (req, res, next) => {

    fetchUsers()
        .then((users) => {
            console.log(users.body)
            res.status(200).send({ users });
        })
        .catch((err) => {
            next(err);
        });
};