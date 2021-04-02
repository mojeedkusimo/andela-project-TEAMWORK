const jwt = require('jsonwebtoken');
require("dotenv").config();

const SECRETE_KEY = process.env.SECRETE_KEY

let adminRoutes = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if ( !token ) {
            return res.json({
                status: 'error',
                error: 'Unathourized!...'
            })
        }

        let userObj = jwt.verify(token.split(" ")[1], SECRETE_KEY);

        if ( !userObj.isadmin ) {
            return res.json({
                status: 'error',
                error: 'Unathourized!...'
            })
        }
        return next();   
    }
    catch (e) {
        return next(e);
    }
}

let isLoggedIn = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if ( !token ) {
            return res.json({
                status: 'error',
                error: 'Please register or login on our platform to get access..'
            })
        }

        let userObj = jwt.verify(token.split(" ")[1], SECRETE_KEY);

        req.userObj = userObj;
        return next();   
    }
    catch (e) {
        return next(e);
    }
}


module.exports = {
    adminRoutes, isLoggedIn
}