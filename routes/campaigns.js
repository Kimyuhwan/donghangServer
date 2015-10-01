/**
 * Created by yuhwan on 2015. 8. 24..
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Campaign = require('../models/campaign');
var tools = require('../tools/tools');

/* GET Campaigns */
router.get('/', ensureAuthorized, function(req, res) {
    Campaign.find({}, 'campaign_id name icon rep_video rep_picture num_of_participants participation', function (err, campaigns) {
        if (err) return console.error(err);
        console.log(campaigns);
        res.json({type: true, data: campaigns});
    });
});

/* GET SINGLE Campaign */
router.get('/:campaign_id', ensureAuthorized, function(req, res) {

    Campaign.findOne({campaign_id : req.params.campaign_id}, function (err, campaign) {
        if (err) return console.error(err);
        console.log('campaign : ' + campaign);
        res.json({type: true, data: campaign});
    });

});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        console.log("token: " + req.token);

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
