

//expressjwt is used to check if user has a token or not inoder to have access to the token
//to secure our server
//https://jwt.io/
//isRevoked is function used to specify if the user is admin or not


const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
    }).unless({
        path: [
            // Public routes that don't require authentication
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/users\/login/, methods: ['POST'] },
            { url: /\/api\/v1\/users\/register/, methods: ['POST'] }
        ]
    });
}

module.exports = authJwt;





// payload = data in the token
//  not admin will be regected

//unless method is used to exclude the apis from authentication


//Admin
//elishaibukun
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmViNzE2OWQ0YWMxMDE0YTdhZTYyMWMiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2NTk2MTE3Njh9.4npHHvhq5KcQH98xVxzskHGB592z5ztHDxcoIrIsmMk

//non admin
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmViYWNmM2JjMzc3NjIzYzZhZjViNmQiLCJpYXQiOjE2NTk2MTI0Njh9.SjmfywUfbPK6mQT30K9bZ6gnPTvWbfy82jaHCHQaDrY
//auspicious