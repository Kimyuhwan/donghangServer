var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Code = require('../models/code');
var jwt = require("jsonwebtoken");

/* POST Sign Up */
router.post('/signup', function(req, res) {

    User.findOne({id: req.body.id}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "이미 가입된 번호입니다."
                });
            } else {
                var userModel = new User();
                userModel.id = req.body.id;
                userModel.nickname = req.body.nickname;
                userModel.password = req.body.password;
                userModel.token = jwt.sign(userModel, 'secret', { algorithm: 'HS256' });
                userModel.push_token = req.body.push_token;
                userModel.platform = req.body.platform;

                userModel.save(function(err, user) {
                    if(err) console.log(err);
                    res.json({
                        type: true,
                        token: user.token
                    });
                });
            }
        }
    });
});


/* POST Sign In */
router.post('/signin', function(req, res) {

    User.findOne({ id: req.body.id, password: req.body.password }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if(user) {
                // 로그인 성공을 보내줌
                res.json({
                    type: true,
                    token: user.token
                });
                // push_token 이 다르면 업데이트
                if(user.push_token !== req.body.push_token && req.body.push_token !== undefined) {
                    user.push_token = req.body.push_token;
                    user.platform = req.body.platform;

                    user.save(function(err) {
                        if (err) console.log('err');
                        else console.log('success');
                    });
                }
            } else {
                res.json({
                    type: false,
                    data: "Invalid id or password"
                });
            }
        }
    });
});

/* POST Auto Sign in */
router.post('/autosignin', function(req, res) {
    var decoded = jwt.decode(req.body.access_token);
    var id = decoded.id;
    var pwd = decoded.password;

    User.findOne({ id: id, password: pwd }, function(err, user) {
        if (err) {
            res.json({
                type: false
            });
        } else {
            if(user) {
                // 로그인 성공을 보내줌
                res.json({
                    type: true
                });

            } else {
                res.json({
                    type: false
                });
            }
        }
    });
});

module.exports = router;
