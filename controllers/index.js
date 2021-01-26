const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

let createUser = async (req, res, next) => {
    // gender, jobRole, department, address 
    try {
        let { firstname, lastname, email, password } = req.body;

        let salt = 5;
        let hasedPassword = await bcrypt.hash(password, salt);
        
        let user = await db.query("INSERT INTO users ( firstname, lastname, email, password ) VALUES ( $1, $2, $3, $4 ) RETURNING *", [firstname, lastname, email, hasedPassword]);

        let userObj = user.rows[0];


        return res.json({
            status: "success",
            data: [userObj]
        })
    }
    catch (e) {

    }
}

let signIn = () => {
    
}


module.exports = {
    createUser, signIn
}