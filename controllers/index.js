const express = require("express");
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

        let { id, firstname, lastname, isadmin } = userObj;
        let userToken = { id, firstname, lastname, email, isadmin };
        let token = jwt.sign(userToken, secret);

        console.log(token);
        return res.json({
            status: 'success',
            data: {
                token,
                userId: id
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


        let gif = await db.query('INSERT INTO gifs (gif_title, gif_url, createdon) VALUES ($1, $2, $3) RETURNING *', [title, image, timeCreated.rows[0].now]);

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


        let articleRes = await db.query('INSERT INTO articles (article_title, article_body, posted_by, createdon) VALUES ($1, $2, $3, $4) RETURNING *', [title, article, req.userObj.id, timeCreated.rows[0].now]);

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

module.exports = {
    createUser, signIn, postGif, postArticle
}