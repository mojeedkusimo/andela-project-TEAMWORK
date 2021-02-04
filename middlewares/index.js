const jwt = require('jsonwebtoken');

let adminRoutes = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if ( !token ) {
            return res.json({
                status: 'error',
                error: 'Please register on our platform to get access..'
            })
        }

        let userObj = jwt.verify(token.split(" ")[1], 'SECRETE');

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

        let userObj = jwt.verify(token.split(" ")[1], 'SECRETE');

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