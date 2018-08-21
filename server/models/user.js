const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config/config').get(process.env.Node_ENV);
const SALT_I = 10;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlenght: 6
    },
    name: {
        type: String,
        maxlenght: 100
    },
    lastname: {
        type: String,
        maxlenght: 100
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
})

userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_I, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, same) => {
        if (err) return cb(err);
        cb(null, same)
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), config.SECRET);

    user.token = token;
    user.save((err, user) => {
        if (err) return cb(err);
        cb(null, user);
    })
}

userSchema.methods.deleteToken = function (token, cb) {
    var user = this;

    user.update({ $unset: { token: 1 } }, (err, user) => {
        if (err) return cb(err);
        cb(null, user)
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    jwt.verify(token, config.SECRET, (err, decode) => {
        user.findOne({ '_id': decode, 'token': token }, (err, user) => {
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }