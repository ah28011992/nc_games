const db = require('../db/connection');

//1. '/api/categories'

exports.fetchAllCategories = () => {
    return db.query('SELECT * FROM categories;')
        .then((result) => {

            return result.rows;
        });
};

//2. /api/reviews /: review_id

exports.selectReviewById = (id) => {

    return db.query('SELECT * FROM reviews WHERE review_id = $1;', [id]).then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({
                status: 404, msg: 'No review exists with that ID'
            })
        } else {

            return result.rows[0]
        }
    })
}




//3.  /api/reviews'

exports.selectAllReviews = () => {

    return db.query(`
        SELECT reviews.review_id, owner, title, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON comments.review_id = reviews.review_id GROUP BY reviews.review_id ORDER BY reviews.created_at DESC;`)
        .then((reviews) => {
            return reviews.rows


        });
};


4.// /api/reviews /: review_id /
exports.selectComments = (review_id) => {


    return db
        .query(`SELECT * FROM comments WHERE review_id = $1;`, [review_id])
        .then((res) => {
            return res.rows;
        })


}

// 5.
