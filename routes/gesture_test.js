/**
 * Created by yuhwan on 2015. 9. 13..
 */
var express = require('express');
var router = express.Router();
var Ground = require('../models/ground');

/* POST GESTURE CHECK. */
router.post('/save', function(req, res) {

    Ground.find({ground_id : req.body.ground_id}).remove().exec();

    var ground = new Ground();
    ground.ground_id = req.body.ground_id;

    // make equal length.
    var accel_x = req.body.accel_x;
    var accel_y = req.body.accel_y;
    var accel_z = req.body.accel_z;

    if(accel_x.length === accel_y.length && accel_x.length === accel_z.length && accel_y.length === accel_z.length) {
        ground.accel_x = req.body.accel_x;
        ground.accel_y = req.body.accel_y;
        ground.accel_z = req.body.accel_z;
    } else {
        var min_length = Math.min(accel_x.length, accel_y.length, accel_z.length);
        ground.accel_x = [];
        ground.accel_y = [];
        ground.accel_z = [];
        for(var i = 0; i < min_length; i++) {
            ground.accel_x.push(accel_x[i]);
            ground.accel_y.push(accel_y[i]);
            ground.accel_z.push(accel_z[i]);
        }
    }

    ground.save(function(err) {
        if(err) {
            console.log(err);
            res.json({type: false});
        }
        res.json({type: true});
    });

});


router.get('/get', function(req, res) {

    Ground.find({}, function (err, grounds) {
        if (err) return console.error(err);
        res.json({type: true, data: grounds});
    });

});

module.exports = router;