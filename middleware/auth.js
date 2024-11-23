const { User } = require('../models/User');

let auth = (request, response, next) => {
    // 인증 처리를 하는 곳
    
    // client cookie에서 Token을 가져온다.
    let token = request.cookies.x_auth;
    // Token을 Decoding한 후 User를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return response.json({ isAuth: false, error: true})

        request.token = token;
        request.user = user;
        next();
    })
    // 유저가 존재하면 인증 okay

    // 유저가 없으면 인증 No
}

module.exports = { auth };