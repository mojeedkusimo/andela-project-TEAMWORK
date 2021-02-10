const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const SECRETE_KEY = process.env.SECRETE_KEY

let createUser = async (req, res, next) => {
    try {
        let { firstname, lastname, email, password, gender, jobrole, department,address, isadmin } = req.body;

        let salt = 5;
        let hasedPassword = await bcrypt.hash(password, salt);
        
        let user = await db.query("INSERT INTO users ( firstname, lastname, email, password, gender, jobrole, department, address, isadmin ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *", [firstname, lastname, email, hasedPassword, gender, jobrole, department, address, isadmin]);

        let userObj = user.rows[0];

        let { user_id } = userObj;
        let userToken = { user_id, firstname, lastname, email, isadmin };
        let token = jwt.sign(userToken, SECRETE_KEY);

        return res.json({
            status: "success",
            data: {
                message: "User account successfully created",
                token,
                userId: user_id
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        let userObj = user.rows[0];

        if ( !userObj ) {
            return res.json({
                status: 'error',
                error: 'Invalid email'
            })
        }

        let hashedPassword = await bcrypt.compare(password, userObj.password);
        
        if ( !hashedPassword ) {
            return res.json({
                status: 'error',
                error: 'Incorrect password'
            })
        }

        let { user_id, firstname, lastname, isadmin } = userObj;
        let userToken = { user_id, firstname, lastname, email, isadmin };
        let token = jwt.sign(userToken, SECRETE_KEY);

        console.log(token);
        return res.json({
            status: 'success',
            data: {
                token,
                userId: user_id
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let postGif = async (req, res, next) => {
    try {
        let { image, title } = req.body;

        let timeCreated = await db.query('SELECT NOW()');


        let gif = await db.query('INSERT INTO gifs (gif_title, gif_url, createdon, author_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, image, timeCreated.rows[0].now, req.userObj.user_id]);

        let feed = await db.query("INSERT INTO feed (createdon, title, article_url, author_id) VALUES ($1, $2, $3, $4)", [timeCreated.rows[0].now, title, image, req.userObj.user_id ]);

        let { gif_id, gif_title, gif_url, createdon } = gif.rows[0];

        return res.json({
            status: "success",
            data: {
                gifId: gif_id,
                message: "GIF image successfully posted",
                createdOn: createdon,
                title: gif_title, 
                imageUrl: gif_url
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let postArticle = async (req, res, next) => {
    try {
        let { title, article, tags } = req.body;

        let timeCreated = await db.query('SELECT NOW()');
        let articleRes = await db.query('INSERT INTO articles (article_title, article_body, author_id, createdon) VALUES ($1, $2, $3, $4) RETURNING *', [title, article, req.userObj.user_id, timeCreated.rows[0].now]);

        let feed = await db.query("INSERT INTO feed (createdon, title, article_url, author_id) VALUES ($1, $2, $3, $4)", [timeCreated.rows[0].now, title, article, req.userObj.user_id ]);

        let { article_id, article_title, createdon } = articleRes.rows[0];


        tags.forEach(async (val) => {
            let tagQuery = await db.query("INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)", [article_id, val]);
        });

        return res.json({
            status: "success",
            data: {
                message: "Article successfully posted",
                articleId: article_id,
                createdOn: createdon,
                title: article_title
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let editArticle = async (req, res, next) => {
    try {
        let { title, article } = req.body;

        let articleRes = await db.query('UPDATE articles SET article_title=$1, article_body=$2 WHERE article_id=$3 AND author_id=$4 RETURNING *', [title, article, req.params.articleId, req.userObj.user_id]);

        if ( !articleRes.rows[0] ) {
            return res.json({
                status: "error",
                data: {
                    message: "Access Denied!"
                }
            })
        }

        let { article_title, article_body } = articleRes.rows[0];

        return res.json({
            status: "success",
            data: {
                message: "Article successfully updated",
                title: article_title,
                article: article_body
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let deleteArticle = async (req, res, next) => {
    try {
        let articleRes = await db.query('DELETE FROM articles WHERE article_id=$1 AND author_id=$2 RETURNING *', [req.params.articleId, req.userObj.user_id]);

        if ( !articleRes.rows[0] ) {
            return res.json({
                status: "error",
                data: {
                    message: "Access Denied!"
                }
            })
        }

        return res.json({
            status: "success",
            data: {
                message: "Article successfully deleted"
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let deleteGif = async (req, res, next) => {
    try {
        let articleRes = await db.query('DELETE FROM gifs WHERE gif_id=$1 AND author_id=$2 RETURNING *', [req.params.gifId, req.userObj.user_id]);
        
        if ( !articleRes.rows[0] ) {
            return res.json({
                status: "error",
                data: {
                    message: "Access Denied!"
                }
            })
        }

        return res.json({
            status: "success",
            data: {
                message: "gif post successfully deleted"
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let commentArticle = async (req, res, next) => {
    try {

        let timeCreated = await db.query('SELECT NOW()');
        let commentRes = await db.query('INSERT INTO article_comments (article_id,author_id, comment, createdon) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.articleId, req.userObj.user_id, req.body.comment, timeCreated.rows[0].now]);

        let commentInfoObj = await db.query("SELECT c.createdon, a.article_title, a.article_body, c.comment FROM articles a JOIN article_comments c ON a.article_id = c.article_id WHERE c.author_id = $1 order by c.createdon desc;", [req.userObj.user_id]);

        let { createdon, article_title, article_body, comment } = commentInfoObj.rows[0];

        return res.json({
            status: "success",
            data: {
                message: "Comment successfully created",
                createdOn: createdon,
                articleTitle: article_title,
                article: article_body,
                comment
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let commentGif = async (req, res, next) => {
    try {

        let timeCreated = await db.query('SELECT NOW()');
        let commentRes = await db.query('INSERT INTO gif_comments (gif_id, author_id, comment, createdon) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.gifId, req.userObj.user_id, req.body.comment, timeCreated.rows[0].now]);

        let commentInfoObj = await db.query("SELECT c.createdon, g.gif_title, c.comment FROM gifs g JOIN gif_comments c ON g.gif_id = c.gif_id WHERE c.author_id = $1 order by c.createdon desc;", [req.userObj.user_id]);

        let { createdon, gif_title, comment } = commentInfoObj.rows[0];

        return res.json({
            status: "success",
            data: {
                message: "Comment successfully created",
                createdOn: createdon,
                gifTitle: gif_title,
                comment
            }
        })
    }
    catch (e) {
        return next(e);
    }
}

let getFeed = async (req, res, next) => {
    try {
        let feed = await db.query("SELECT * FROM feed order by feed_id desc");
    
        return res.json({
            status: "success",
            data: [feed.rows]
        });
    }
    catch (e) {
        return next(e);
    }
}

let getArticle = async (req, res, next) => {
    try {
        let articleFetch = await db.query("SELECT article_id, createdon, article_title, article_body FROM articles WHERE article_id = $1", [ req.params.articleId ]);

        if (!articleFetch.rows[0]) {
            return res.json({
                status: "error",
                message: "Article does not exist..."
            });
        }

        let commentFetch = await db.query("SELECT article_comment_id, comment, author_id FROM article_comments WHERE article_id = $1", [req.params.articleId]);

        let tagFetch = await db.query("SELECT tag FROM tags t JOIN article_tags at ON t.tag_id = at.tag_id WHERE article_id = $1", [req.params.articleId]);
        let tags = [];

        tagFetch.rows.forEach((val) => {
            tags.push(val.tag);
        });

        let { article_id, createdon, article_title, article_body } = articleFetch.rows[0];

        return res.json({
            status: "success",
            data: {
                id: article_id,
                createdOn: createdon,
                title: article_title,
                article: article_body,
                tags,
                comments: commentFetch.rows
            }
        });
    }
    catch (e) {
        return next(e);
    }
}

let getGif = async (req, res, next) => {
    try {
        let gifFetch = await db.query("SELECT gif_id, createdon, gif_title, gif_url FROM gifs WHERE gif_id = $1", [ req.params.gifId ]);

        if (!gifFetch.rows[0]) {
            return res.json({
                status: "error",
                message: "GIF does not exist..."
            });
        }

        let commentFetch = await db.query("SELECT gif_comment_id, comment, author_id FROM gif_comments WHERE gif_id = $1", [req.params.gifId]);

        let { gif_id, createdon, gif_title, gif_url } = gifFetch.rows[0];

        return res.json({
            status: "success",
            data: {
                id: gif_id,
                createdOn: createdon,
                title: gif_title,
                url: gif_url,
                comments: commentFetch.rows
            }
        });
    }
    catch (e) {
        return next(e);
    }
}

let flagArticle = async (req, res, next) => {
    try {
        let flagQuery = await db.query("UPDATE articles SET flagged = true WHERE article_id = $1 RETURNING *", [req.params.articleId]);

        if ( !flagQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "Article was not found"
            })
        }

        let { article_title } = flagQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "Article has been successfully flagged",
            articleTitle: article_title
        })
    }
    catch (e) {
        return next(e);
    }

}

let deleteFlaggedArticle = async (req, res, next) => {
    try {
        let checkQuery = await db.query("SELECT * FROM articles WHERE article_id = $1", [req.params.articleId]);

        if ( !checkQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "Article was not found"
            })
        }

        let deleteQuery = await db.query("DELETE FROM articles WHERE article_id = $1 AND flagged = true RETURNING *", [req.params.articleId]);

        if (!deleteQuery.rows[0]) {
            return res.json({
                status: "error",
                message: "Article is not flagged and cannot be deleted",
            })
        }
        let { article_title } = deleteQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "Article has been successfully deleted",
            articleTitle: article_title
        })
    }
    catch (e) {
        return next(e);
    }

}

let flagGif = async (req, res, next) => {
    try {
        let flagQuery = await db.query("UPDATE gifs SET flagged = true WHERE gif_id = $1 RETURNING *", [req.params.gifId]);

        if ( !flagQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "GIF was not found"
            })
        }

        let { gif_title } = flagQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "GIF has been successfully flagged",
            gifTitle: gif_title
        })
    }
    catch (e) {
        return next(e);
    }

}

let deleteFlaggedGif = async (req, res, next) => {
    try {
        let checkQuery = await db.query("SELECT * FROM gifs WHERE gif_id = $1", [req.params.gifId]);

        if ( !checkQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "GIF was not found"
            })
        }

        let deleteQuery = await db.query("DELETE FROM gifs WHERE gif_id = $1 AND flagged = true RETURNING *", [req.params.gifId]);

        if (!deleteQuery.rows[0]) {
            return res.json({
                status: "error",
                message: "GIF is not flagged and cannot be deleted",
            })
        }
        let { gif_title } = deleteQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "GIF has been successfully deleted",
            gifTitle: gif_title
        })
    }
    catch (e) {
        return next(e);
    }

}

let flagArticleComment = async (req, res, next) => {
    try {

        let flagQuery = await db.query("UPDATE article_comments SET flagged = true WHERE article_comment_id = $1 RETURNING *", [req.params.commentId]);

        if ( !flagQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "Article comment was not found"
            })
        }

        let { comment } = flagQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "Article  comment has been successfully flagged",
            comment
        })
    }
    catch (e) {
        return next(e);
    }

}

let deleteFlaggedArticleComment = async (req, res, next) => {
    try {
        let checkQuery = await db.query("SELECT * FROM article_comments WHERE article_comment_id = $1", [req.params.commentId]);

        if ( !checkQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "Article comment was not found"
            })
        }

        let deleteQuery = await db.query("DELETE FROM article_comments WHERE article_comment_id = $1 AND flagged = true RETURNING *", [req.params.commentId]);

        if (!deleteQuery.rows[0]) {
            return res.json({
                status: "error",
                message: "Article comment is not flagged and cannot be deleted",
            })
        }
        let { comment } = deleteQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "Article comment has been successfully deleted",
            comment
        })
    }
    catch (e) {
        return next(e);
    }

}

let flagGifComment = async (req, res, next) => {
    try {
        let flagQuery = await db.query("UPDATE gif_comments SET flagged = true WHERE gif_comment_id = $1 RETURNING *", [req.params.commentId]);

        if ( !flagQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "GIF comment was not found"
            })
        }

        let { comment } = flagQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "GIF comment has been successfully flagged",
            comment
        })
    }
    catch (e) {
        return next(e);
    }

}

let deleteFlaggedGifComment = async (req, res, next) => {
    try {
        let checkQuery = await db.query("SELECT * FROM gif_comments WHERE gif_comment_id = $1", [req.params.commentId]);

        if ( !checkQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "GIF Comment was not found"
            })
        }

        let deleteQuery = await db.query("DELETE FROM gif_comments WHERE gif_comment_id = $1 AND flagged = true RETURNING *", [req.params.commentId]);

        if (!deleteQuery.rows[0]) {
            return res.json({
                status: "error",
                message: "GIF comment is not flagged and cannot be deleted",
            })
        }
        let { comment } = deleteQuery.rows[0];
    
        return res.json({
            status: "success",
            message: "GIF comment has been successfully deleted",
            comment
        })
    }
    catch (e) {
        return next(e);
    }

}

let getArticleTag = async (req, res, next) => {
    try {
        let checkQuery = await db.query("SELECT * FROM tags WHERE tag_id = $1", [req.params.tagId]);

        if ( !checkQuery.rows[0] ) {
            return res.json({
                status: "error",
                message: "Tag was not found"
            })
        }

        let tagQuery = await db.query("SELECT a.article_id, a.createdon, a.article_title, a.article_body, a.author_id FROM articles a join article_tags at ON a.article_id = at.article_id WHERE tag_id=$1", [req.params.tagId]);

        return res.json({
            status: "success",
            data: tagQuery.rows
        })
    }
    catch (e) {
        return next(e);
    }
}

module.exports = {
    createUser, signIn, postGif, postArticle, editArticle, deleteArticle, deleteGif, commentArticle, commentGif, getFeed, getArticle, getGif, flagArticle, deleteFlaggedArticle, flagGif, deleteFlaggedGif, flagArticleComment, deleteFlaggedArticleComment, flagGifComment, deleteFlaggedGifComment, getArticleTag
}