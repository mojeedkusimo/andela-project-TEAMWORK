const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

let secret= 'SECRETE';
let createUser = async (req, res, next) => {
    try {
        let { firstname, lastname, email, password, gender, jobrole, department,address, isadmin } = req.body;

        let salt = 5;
        let hasedPassword = await bcrypt.hash(password, salt);
        
        let user = await db.query("INSERT INTO users ( firstname, lastname, email, password, gender, jobrole, department, address, isadmin ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *", [firstname, lastname, email, hasedPassword, gender, jobrole, department, address, isadmin]);

        let userObj = user.rows[0];

        let userToken = { firstname, lastname, email, isadmin };
        let token = jwt.sign(userToken, secret);

        return res.json({
            status: "success",
            data: {
                message: "User account successfully created",
                token,
                userId: userObj.id
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
        let token = jwt.sign(userToken, secret);

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


        let gif = await db.query('INSERT INTO gifs (gif_title, gif_url, createdon, posted_by_user_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, image, timeCreated.rows[0].now, req.userObj.user_id]);

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
        let { title, article } = req.body;

        let timeCreated = await db.query('SELECT NOW()');
        let articleRes = await db.query('INSERT INTO articles (article_title, article_body, posted_by_user_id, createdon) VALUES ($1, $2, $3, $4) RETURNING *', [title, article, req.userObj.user_id, timeCreated.rows[0].now]);

        let { article_id, article_title, createdon } = articleRes.rows[0];

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

        let articleRes = await db.query('UPDATE articles SET article_title=$1, article_body=$2 WHERE article_id=$3 AND posted_by_user_id=$4 RETURNING *', [title, article, req.params.articleId, req.userObj.user_id]);

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
        let articleRes = await db.query('DELETE FROM articles WHERE article_id=$1 AND posted_by_user_id=$2 RETURNING *', [req.params.articleId, req.userObj.user_id]);

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
        let articleRes = await db.query('DELETE FROM gifs WHERE gif_id=$1 AND posted_by_user_id=$2 RETURNING *', [req.params.gifId, req.userObj.user_id]);
        
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


module.exports = {
    createUser, signIn, postGif, postArticle, editArticle, deleteArticle, deleteGif
}