const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const endPoints = require('../endpoints.json')

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('app', () => {
    describe("GET /api/categories", () => {
        it("200: responds with an array of categories", () => {
            return request(app)
                .get("/api/categories")
                .expect(200)
                .then((res) => {
                    const { body } = res
                    expect(body).toHaveLength(4);
                    body.forEach((category) => {
                        expect(category).toMatchObject({
                            slug: expect.any(String),
                            description: expect.any(String),
                        });
                    });

                })
        });
        it('404: responds with an error message if user inputs an incorrect path', () => {
            return request(app)
                .get('/api/categories/notpath')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Not found');
                });
        });

    });
    describe("/api/reviews/:review_id", () => {

        it("200: responds with review object with correct properties ", () => {
            return request(app)
                .get("/api/reviews/3")
                .expect(200)
                .then((res) => {
                    expect(res.body.review).toMatchObject({
                        owner: expect.any(String),
                        title: expect.any(String),
                        review_id: 3,
                        review_body: expect.any(String),
                        designer: expect.any(String),
                        review_img_url: expect.any(String),
                        category: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),

                    });
                })
        });
        it('404: responds with an error message if user inputs an invalid id', () => {
            return request(app)
                .get('/api/reviews/5000')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('No review exists with that ID');
                });
        });

        describe('GET /api/reviews', () => {
            test('responds with 200 and an array of reviews', () => {
                return request(app)
                    .get('/api/reviews')
                    .expect(200)
                    .then((result) => {
                        const { reviews } = result.body;
                        expect(Array.isArray(reviews)).toBe(true);
                        expect(reviews).toHaveLength(13);
                        reviews.forEach((review) => {
                            expect(review).toEqual(
                                expect.objectContaining({
                                    owner: expect.any(String),
                                    title: expect.any(String),
                                    review_id: expect.any(Number),
                                    designer: expect.any(String),
                                    category: expect.any(String),
                                    created_at: expect.any(String),
                                    votes: expect.any(Number),
                                    comment_count: expect.any(Number)
                                })
                            );
                        });
                    });
            });
            test('responds with 200 and an array of reviews sorted by date by default', () => {
                return request(app)
                    .get('/api/reviews')
                    .expect(200)
                    .then((result) => {
                        const { reviews } = result.body;
                        expect(reviews).toBeSortedBy('created_at', { 'descending': true });
                    });
            });

        })
        describe('GET /api/reviews/:review_id/comments', () => {
            test('200:responds with an array of comments for the given review_id', () => {
                return request(app)
                    .get('/api/reviews/2/comments')
                    .expect(200)
                    .then((res) => {
                        const { comments } = res.body;
                        expect(Array.isArray(comments)).toBe(true);
                        expect(comments).toHaveLength(3);
                        comments.forEach((comment) => {
                            expect(comment).toEqual(
                                expect.objectContaining({
                                    comment_id: expect.any(Number),
                                    votes: expect.any(Number),
                                    created_at: expect.any(String),
                                    author: expect.any(String),
                                    body: expect.any(String)
                                })
                            );
                        });
                    });

            });

            test('200: responds with an empty array when given a valid id that has no comments', () => {
                return request(app)
                    .get('/api/reviews/5/comments')
                    .expect(200)
                    .then((res) => {
                        const { comments } = res.body;
                        expect(Array.isArray(comments)).toBe(true);
                        expect(comments).toHaveLength(0);
                    });
            });

            test('400: responds "Bad request" when given and invalid type', () => {
                return request(app)
                    .get('/api/reviews/non/comments')
                    .expect(400)
                    .then((res) => {
                        expect(res.body.msg).toEqual('Bad request');
                    });
            });
            test("404: responds with  status message when review_id doesn't exist", () => {
                return request(app)
                    .get("/api/reviews/66/comments")
                    .expect(404)
                    .then((res) => {
                        expect(res.body.msg).toBe("No review exists with that ID");
                    });
            });
        })
    })
    describe('POST /api/reviews/:review_id/comments', () => {
        test('responds with 201 with the posted comment', () => {
            return request(app)
                .post('/api/reviews/1/comments')
                .send({ username: 'bainesface', body: 'It is okay' })
                .expect(201)
                .then((res) => {
                    const { comment } = res.body;
                    expect(comment).toHaveLength(1);
                    comment.forEach((result) => {
                        expect(result).toEqual(
                            expect.objectContaining({
                                comment_id: expect.any(Number),
                                votes: expect.any(Number),
                                created_at: expect.any(String),
                                author: expect.any(String),
                                body: expect.any(String)
                            })
                        );
                    });
                });
        });
        test('responds with 404 when given a non existent review_id', () => {
            return request(app)
                .post('/api/reviews/9999999/comments')
                .send({ username: 'bainesface', body: 'It is okay' })
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toEqual('Please provide a valid review_id');
                });

        });
        test('responds with 404 when given an invalid username', () => {
            return request(app)
                .post('/api/reviews/3/comments')
                .send({ username: 'nonsense', body: 'It is okay' })
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toEqual('Please provide a valid username');
                });
        })
        test('responds with 400 when given an invalid type', () => {
            return request(app)
                .post('/api/reviews/nonsense/comments')
                .send({ username: 'bainesface', body: 'It is okay' })
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toEqual('Bad request');
                });
        })
    })
    describe('PATCH /api/reviews/:review_id', () => {
        test('responds with 200 and updated review - incrementing the vote', () => {
            return request(app)
                .patch('/api/reviews/1')
                .send({ inc_votes: 2 })
                .expect(200)
                .then((res) => {
                    expect(res.body).toEqual({
                        updated_review: {
                            review_id: 1,
                            title: 'Agricola',
                            category: 'euro game',
                            designer: 'Uwe Rosenberg',
                            owner: 'mallionaire',
                            review_body: 'Farmyard fun!',
                            review_img_url: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700',
                            created_at: expect.any(String),
                            votes: 3
                        }
                    });
                });
        });
        test('responds with 200 and updated review - decrementing the vote', () => {
            return request(app)
                .patch('/api/reviews/1')
                .send({ inc_votes: -2 })
                .expect(200)
                .then((res) => {
                    expect(res.body).toEqual({
                        updated_review: {
                            review_id: 1,
                            title: 'Agricola',
                            category: 'euro game',
                            designer: 'Uwe Rosenberg',
                            owner: 'mallionaire',
                            review_body: 'Farmyard fun!',
                            review_img_url: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700',
                            created_at: expect.any(String),
                            votes: -1
                        }
                    });
                });
        });
        test('responds with 400 when given an invalid id', () => {
            return request(app)
                .patch('/api/reviews/49')
                .send({ inc_votes: -2 })
                .expect(400)
                .then((res) => {
                    const { body } = res;
                    expect(body.msg).toBe('Invalid request');
                });
        });
        test('responds with 400 when given an invalid id type', () => {
            return request(app)
                .patch('/api/reviews/string')
                .send({ inc_votes: -2 })
                .expect(400)
                .then((res) => {
                    const { body } = res;
                    expect(body.msg).toBe('Bad request');
                });
        });

    })

    describe('DELETE /api/comments/:comment_id', () => {
        test('responds with 204, no content and deletes the given comment', () => {
            return request(app).delete('/api/comments/1').expect(204);
        });
        test('responds with 404 when given a non existent comment id', () => {
            return request(app)
                .delete('/api/comments/49')
                .expect(404)
                .then((result) => {
                    expect(result.body.msg).toEqual('Not found');
                });
        });
        test('responds with 400 when given an invalid id type', () => {
            return request(app)
                .delete('/api/comments/nonsense')
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toEqual('Please provide a valid comment_id');
                });
        });
    });
    describe("GET /api/users", () => {

        test("200: responds with an array of users", () => {
            return request(app)
                .get("/api/users")
                .then((res) => {
                    expect(Array.isArray(res.body.users)).toBe(true);
                    expect(res.body.users).toHaveLength(4);
                    res.body.users.forEach((user) => {
                        expect(user).toHaveProperty("username");
                        expect(user).toHaveProperty("avatar_url");
                        expect(user).toHaveProperty("name");
                    });
                });
        });
    });
});


