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

    return db.query('SELECT *, CAST((SELECT COUNT(*) FROM comments WHERE comments.review_id = reviews.review_id) AS INTEGER) as comment_count FROM reviews WHERE review_id = $1;', [id]).then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({
                status: 404, msg: 'No review exists with that ID'
            })
        } else {
            console.log(result.rows[0])
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
}


4.// /api/reviews /: review_id / comments
exports.selectComments = (review_id) => {


    return db
        .query(`SELECT * FROM comments WHERE review_id = $1;`, [review_id])
        .then((res) => {
            return res.rows;
        })


}

// 5.

// POST 
exports.addComments = (review_id, username, body) => {
    const idNum = parseInt(review_id);

    return db
        .query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: 'Please provide a valid review_id'
                });
            } else {
                return db
                    .query(`SELECT * FROM users WHERE username = $1;`, [username])
                    .then((result) => {
                        if (result.rows.length === 0) {
                            return Promise.reject({
                                status: 404,
                                msg: 'Please provide a valid username'
                            });
                        } else {
                            return db
                                .query(
                                    `INSERT INTO comments (review_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
                                    [review_id, username, body]
                                )
                                .then((result) => {
                                    return result.rows;
                                })

                        }
                    });
            }
        });
}

exports.updateVotes = (review_id, inc_votes) => {
    const idNum = parseInt(review_id);
    if (!Number.isNaN(idNum)) {
        return db
            .query(`SELECT votes FROM reviews WHERE review_id = $1;`, [review_id])
            .then((result) => {
                if (result.rows.length === 0 || typeof inc_votes !== 'number') {
                    return Promise.reject({ status: 400, msg: 'Invalid request' });
                } else {
                    const newVotes = result.rows[0].votes + inc_votes;
                    return db
                        .query(
                            `UPDATE reviews SET votes = $1 WHERE review_id = $2 RETURNING *;`,
                            [newVotes, review_id]
                        )
                        .then((result) => {
                            return result.rows[0];
                        });
                }
            });
    } else {
        return Promise.reject({
            status: 400,
            msg: 'Bad request'
        });
    }
};
exports.selectComment = (comment_id) => {
    if (!Number.isInteger(+comment_id)) {
        return Promise.reject({
            status: 400,
            msg: "Please provide a valid comment_id",
        });
    }
    return db
        .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Not found",
                });
            } else {
                return db.query(`DELETE FROM comments WHERE comment_id = $1;`, [
                    comment_id,
                ]);
            }
        });
};

exports.fetchUsers = () => {
    return db.query(`SELECT * FROM users;`).then((result) => {
        console.log(result.rows)
        return result.rows;
    });
};