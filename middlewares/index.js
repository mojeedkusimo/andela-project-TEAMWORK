const express = require('express');
const jwt = require('jsonwebtoken');

let adminRoutes = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let userObj = jwt.verify(token, 'SECRETE');

        if ( !userObj.isadmin ) {
            return res.json({
                status: 'error',
                error: 'Unathourized!'
            })
        }

        return next();
        
    }
    catch (e) {
        return next(e);
    }
}




module.exports = {
    adminRoutes
}