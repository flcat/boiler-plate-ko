const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        maxlength: 50,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')) {
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash;
                return next();
            })
        })
    } else {
        return next();
    }
})

userSchema.methods.comparePassword = function(plainPassword) {
    //plainPassword 1234567 암호화된 비밀번호 >>> $2b$10$ygRAJNUVILuAC7PsbwymlOjtCsWk3EkT683Ai3g.xTuE7pMozwTfK
    const user = this;
   return bcrypt.compare(plainPassword, this.password)
}

userSchema.methods.generateToken = function() {

    const user = this;

    const token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.token = token;

    return user.save();
}

userSchema.statics.findByToken = function(token, callback) {
    const user = this;
    
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // User ID를 이용해서 User를 찾은 다음
        // Client에서 가져온 Token과 DB에 보관된 Token이 일치하는지 확인
        user.findOne({ "_id": decoded, "token": token})
        .then(user => {
            return callback(null, user);
        })
        .catch(err => {
            console.log(err)
            return callback(err);
        });
    });
}

const User = mongoose.model('User', userSchema);

module.exports = { User }

