const express = require('express');
const app = express();
const port = 5500
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const config = require('./config/key')
const { auth } = require('./middleware/auth')
const { User } = require('./models/User')

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))




app.get('/', (req, res) => res.send('Hello World! 안녕하십니까 허허허'))

app.post('/register', async (request, response) => {
    const user = new User(request.body)
    await user.save().then(() => {
        if (err) return response.json({ success: false, err })
        return response.status(200).json({ success: true, message: "아이디가 등록 되었습니다." })
    })
    .catch((err) => {
        return response.status(400).send(err);
    })
})

app.post('/api/users/login', (request, response) => {

    // 요청된 이메일을 데이터베이스에서 있는지 찾는다
    User.findOne({ email: request.body.email })
    .then(async user => {
        if(!user) {
            throw new Error("제공된 이메일에 해당하는 유저가 없습니다.")
        }
        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인한다.
        const isMatch = await user.comparePassword(request.body.password);
        return { isMatch, user};
    })
    .then(({ isMatch, user}) => {
        console.log(isMatch);
        if(!isMatch) {
            throw new Error ("입력하신 정보가 틀렸습니다.")
        }

        return user.generateToken();
    })
    .then(user => {
        // 비밀번호까지 맞다면 토큰 생성하기.
        return response.cookie("x_auth", user.token)
        .status(200)
        .json({
            loginSuccess: true,
            userId: user._id
        });
    })
    .catch((err) => {
        console.log(err);
        return response.status(400).json({
            loginSuccess: false,
            message: err.message
        });
    })
});

app.get('/api/users/auth', auth, (request,response) => {
    // 여기까지 middleware를 통과했다는 얘기는 Authentication 이 True 라는 뜻.
    response
    .status(200)
    .json({
        _id: request.user._id,
        isAdmin: request.user.role === 0 ? false : true,
        isAuth: true,
        email: request.user.email,
        name: request.user.name,
        lastname: request.user.lastname,
        role: request.user.role,
        image: request.user.image
    });
});

app.get('/api/users/logout', auth, (request,response) => {

    User.findOneAndUpdate({ _id: request.user._id}, {token: ""})
    .then(() => {
            return response.status(200).send({
                success:true,
            });
        })
    .catch((err) => {
        return response.json({ success: false, err});
    });
});



app.listen(port, () => console.log(`Example app listening on port ${port}`))