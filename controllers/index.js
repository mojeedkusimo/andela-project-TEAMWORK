const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

let createUser = async (req, res, next) => {
    // 
    try {
        let { firstname, lastname, email, password, gender, jobrole, department,address, isadmin } = req.body;

        let salt = 5;
        let hasedPassword = await bcrypt.hash(password, salt);
        
        let user = await db.query("INSERT INTO users ( firstname, lastname, email, password, gender, jobrole, department, address, isadmin ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *", [firstname, lastname, email, hasedPassword, gender, jobrole, department, address, isadmin]);

        let userObj = user.rows[0];


        return res.json({
            status: "success",
            data: [userObj]
        })
    }
    catch (e) {
        return next(e);
    }
}

let signIn = () => {
    
}


module.exports = {
    createUser, signIn
}