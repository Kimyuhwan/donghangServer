/**
 * Created by yuhwan on 2015. 9. 2..
 */
var express = require('express');
var router = express.Router();
var Campaign = require('../models/campaign');

/* POST GESTURE CHECK. */
router.post('/check', function(req, res) {

    Campaign.findOne({campaign_id : 1}, function (err, campaign) {
        if (err) return console.error(err);
        var ground_motion = campaign.ground_motion;
        var similarity = DTW(ground_motion, req.body.gesture).toFixed(4);
        res.json({type: true, data: similarity + '의 유사도를 가진 제스처입니다.'});
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

function DTW(firstSequence, secondSequence) {

  var state = {
      distanceCostMatrix: null,
      distance: function (x, y) {
          var difference = x - y;
          var squaredEuclideanDistance = difference * difference;
          return squaredEuclideanDistance;
      }
  };

  var cost = Number.POSITIVE_INFINITY;
  cost = computeOptimalPath(firstSequence, secondSequence, state);
  return cost;

};

function computeOptimalPath(s, t, state) {
  var start = new Date().getTime();
  state.m = s.length;
  state.n = t.length;
  var distanceCostMatrix = createMatrix(state.m, state.n, Number.POSITIVE_INFINITY);

  distanceCostMatrix[0][0] = state.distance(s[0], t[0]);

  for (var rowIndex = 1; rowIndex < state.m; rowIndex++) {
      var cost = state.distance(s[rowIndex], t[0]);
      distanceCostMatrix[rowIndex][0] = cost + distanceCostMatrix[rowIndex - 1][0];
  }

  for (var columnIndex = 1; columnIndex < state.n; columnIndex++) {
      var cost = state.distance(s[0], t[columnIndex]);
      distanceCostMatrix[0][columnIndex] = cost + distanceCostMatrix[0][columnIndex - 1];
  }

  for (var rowIndex = 1; rowIndex < state.m; rowIndex++) {
      for (var columnIndex = 1; columnIndex < state.n; columnIndex++) {
          var cost = state.distance(s[rowIndex], t[columnIndex]);
          distanceCostMatrix[rowIndex][columnIndex] =
              cost + Math.min(
                  distanceCostMatrix[rowIndex - 1][columnIndex],          // Insertion
                  distanceCostMatrix[rowIndex][columnIndex - 1],          // Deletion
                  distanceCostMatrix[rowIndex - 1][columnIndex - 1]);     // Match
      }
  }

  var end = new Date().getTime();
  var time = end - start;

  state.distanceCostMatrix = distanceCostMatrix;
  state.similarity = distanceCostMatrix[state.m - 1][state.n - 1];
  return state.similarity;
}

    function createMatrix(m, n, value) {
      var matrix = [];
      for (var rowIndex = 0; rowIndex < m; rowIndex++) {
          matrix.push(createArray(n, value));
      }

      return matrix;
    }

function createArray(length, value) {
  if (typeof length !== 'number') {
      throw new TypeError('Invalid length type');
  }

  if (typeof value === 'undefined') {
      throw new Error('Invalid value: expected a value to be provided');
  }

  var array = new Array(length);
  for (var index = 0; index < length; index++) {
      array[index] = value;
  }

  return array;
};

module.exports = router;
