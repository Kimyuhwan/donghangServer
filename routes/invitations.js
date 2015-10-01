/**
 * Created by yuhwan on 2015. 8. 24..
 */
var express = require('express');
var router = express.Router();
var shortid = require('shortid');
var User = require('../models/user');
var Code = require('../models/code');
var Invitation = require('../models/invitation');
var jwt = require("jsonwebtoken");
var pushbots = require('pushbots');
var CronJob = require('cron').CronJob;

//SMS
var ACCOUNT_SID = "ACc98c5301d0f1f130c978d31abf3d7dc0";
var AUTH_TOKEN = "c9fcf110d8a3f91f7088c75fc47f8b3a";
var client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
var Pushbots = new pushbots.api({
    id:'55dfb9e3177959ff558b456b',
    secret:'864d3ffeed9ace050b6a9d0f092fe343'
});

/* POST invite */
router.post('/invite', ensureAuthorized, function(req, res) {

    /** SAVE INVITATION **/
    var invitation_success = false;
    // generate invitation_id
    var invitation_id = "I" + shortid.generate();

    var invitationModel = new Invitation();
    invitationModel.invitation_id = invitation_id;
    invitationModel.donghang_time = null;
    invitationModel.participants_id = [];
    invitationModel.participants_status = [];
    invitationModel.participants_nickname = [];

    // set sender
    var decoded = jwt.decode(req.token);
    var sender_id = decoded.id;
    var sender_nick_name = decoded.nickname;
    invitationModel.participants_id.push(sender_id);
    invitationModel.participants_nickname.push(sender_nick_name);
    invitationModel.participants_status.push(true);

    // recipients : [{recipients.name, recipient.phoneNumber}, ...]

    var recipients = req.body.recipients;
    for(var i = 0; i < recipients.length; i++) {
        invitationModel.participants_id.push(recipients[i].phone_number);
        invitationModel.participants_nickname.push(recipients[i].name);
        invitationModel.participants_status.push(false);
    }

    invitationModel.save(function(err) {
        if(err) console.log(err);
         /** SEND INVITATION_CODE **/
        // 각 사람마다 (recipient) invitation code 만들기
        recipients.forEach(function (recipient) {
            var invitation_code = "C" + shortid.generate();
            var origin_number = recipient.phone_number;
            var number = "+82" + origin_number.substring(1, recipient.phone_number.length);

            // save invitation code
            var codeModel = new Code();
            codeModel.invitation_code = invitation_code;
            codeModel.user_id = recipient.phone_number;
            codeModel.user_nick_name = recipient.name;
            codeModel.sender_id = sender_id;
            codeModel.sender_nick_name = sender_nick_name;

            codeModel.save(function(err) {
                if(err) console.log(err);

                // Find User by ID
                User.findOne({id: origin_number}, function(err, user) {
                    if(user) {
                        // If there is a user, push messages
                        Pushbots.setMessage(user.nickname + "님, 새로운 동행에 초대되었습니다.", 0);
                        Pushbots.customFields({"article_id":"1234"});
                        Pushbots.customNotificationTitle("CUSTOM TITLE");
                        Pushbots.pushOne(user.push_token, function(response){
                            console.log(response);
                        });
                    } else {
                        // If there is no user, send sms
                        client.sendMessage({
                            to: number, // Any number Twilio can deliver to
                            from: '+18556419013', // A number you bought from Twilio and can use for outbound communication
                            body: '동행에 초대합니다. 아래 주소를 클릭해주세요. http://dh.csv.kr:3000/start/' + invitation_code // body of the SMS message
                        }, function(err, responseData) { //this function is executed when a response is received from Twilio
                            if (!err) { // "err" is an error received during the request, if any
                                console.log(responseData.from);
                                console.log(responseData.body);
                            } else {
                                console.log(err);
                            }
                        });
                    }
                });
            });
        });

        console.log("Invitation success");
        res.json({type: true});
    });
});

/* POST valid */
router.post('/valid', function(req, res) {

    Code.findOne({invitation_code : req.body.invitation_code}, function (err, code) {
        if (err) return console.error(err);
        //여기에 valid 하면 state를 true로 만들어주는
        if(code)
            res.json({type: true, data: code});
        else
            res.json({type: false, data: "올바르지 않은 초대 코드 입니다."});
    });

});


/* GET invitations */
router.get('/', ensureAuthorized, function(req, res) {

    var decoded = jwt.decode(req.token);
    var participant_id = decoded.id;
    console.log(participant_id);

    Invitation.find({participants_id : participant_id}, function (err, invitations) {
        if (err) return console.error(err);
        res.json({type: true, data: invitations});
    });
});

/* POST accept an invitation */
router.post('/accept', ensureAuthorized, function(req, res) {

    var decoded = jwt.decode(req.token);
    var participant_id = decoded.id;
    var invitation_id = req.body.invitation_id;
    var my_nick_name = decoded.nickname;

    Invitation.findOne({invitation_id : invitation_id}, function (err, invitation) {
        if(err) res.json({type: false, data: '수락 실패'});
        else {
            if(invitation) {
                // set participant status
                var participants_id = invitation.participants_id;

                var index = participants_id.indexOf(participant_id);
                if(index === -1)
                    res.json({type: false, data: '초대에 해당하지 않는 유저입니다.'});
                else {
                    // 1. update participant status
                    var participants_status = invitation.participants_status;
                    participants_status[index] = true;
                    invitation.participants_status = participants_status;
                    invitation.markModified('participants_status');

                    // check invitation status
                    var result = true;
                    for(var i = 0; i < participants_status.length; i++)
                        result = result && participants_status[i];

                    if(result) {
                        // 2 .update invitation status
                        invitation.invitation_status = true;
                        // 3. update donghang time
                        var date = new Date();
                        var minutesToAdd = 60;
                        invitation.donghang_time = date.setMinutes(date.getMinutes() + minutesToAdd);

                        // 4. set scheduled notifications
                        new CronJob(invitation.donghang_time, function() {
                            // send notifications
                            console.log('send push notifications');
                            console.log(participants_id);

                            for(var i = 0; i < participants_id.length; i++) {
                                var user_id = participants_id[i];

                                User.findOne({id : user_id}, function(err, user) {
                                    if(err) console.log('error');
                                    if(user) {
                                        Pushbots.setMessage(user.nickname + "님, 곧 동행이 시작할 예정입니다.", user.platform);
                                        Pushbots.customFields({"article_id":"1234"});
                                        Pushbots.customNotificationTitle("동행 알림");
                                        Pushbots.pushOne(user.push_token, function(response){
                                            console.log(response);
                                        });
                                    } else {
                                        console.log('no user');
                                    }
                                });

                            }

                        }, null, true, 'Asia/Seoul');
                    }

                    // 나를 제외한 다른 사람에게 수락했다고 푸쉬를 보내기
                    participants_id.forEach(function(recipient_id) {
                        if(recipient_id !== participant_id) {
                            User.findOne({id : recipient_id}, function(err, user) {
                                if(err) console.log('error');
                                if(user) {
                                    Pushbots.setMessage(user.nickname + "님, " + my_nick_name + "님이 초대를 수락하셨습니다. ", user.platform);
                                    Pushbots.customNotificationTitle("동행 알림");
                                    Pushbots.pushOne(user.push_token, function(response){
                                        console.log(response);
                                    });
                                } else {
                                    console.log('no user');
                                }
                            });
                        }
                    });

                    // save modified invitation
                    invitation.save(function(err) {
                        if (err) console.log('invitation update err');
                        else res.json({type: true, data: '수락 성공'});
                    });
                }
            } else {
                res.json({type: false, data: '초대가 존재하지 않습니다.'});
            }
        }
    });

});


function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;

        User.findOne({token: req.token} , function(err, user) {
            if(err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if(user) {
                    next();
                }
                else {
                     res.json({
                    type: false,
                    data: "Error occured: " + err
                });
                }
            }
        });

    } else {
         res.sendStatus(403);
    }
}

module.exports = router;
