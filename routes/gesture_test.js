/**
 * Created by yuhwan on 2015. 9. 13..
 */
var express = require('express');
var router = express.Router();
var Ground = require('../models/ground');
var Template = require('../models/template');
var Collection = require('../models/collection');

/* POST GESTURE CHECK. */
router.post('/save', function(req, res) {

    Ground.count({ground_name: req.body.ground_name}, function(err, c)
    {
        var ground_count = c;
        console.log('Save Ground : ' + req.body.ground_name);

        var ground = new Ground();
        ground.ground_name = req.body.ground_name;
        ground.ground_id = req.body.ground_name + '_' + (ground_count+1);
        console.log('Ground ID : ' + ground.ground_id);

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
            } else {
                res.json({type: true});
            }
        });

    });

});

router.post('/setTemplate', function(req, res) {

    if(req.body.template_name === undefined) {
        console.log('template_name is undefined');
        res.json({type:false});
    }
    else {
        Ground.find({ground_name: req.body.template_name}, function(err, grounds) {
            console.log('the number of grounds for ' + req.body.template_name + ' = ' + grounds.length);
            console.log(grounds[0].ground_name);

            var length = grounds.length;
            // create features with normalization
            for(var k = 0; k < length; k++) {
                var features = [];

                for(var f = 0; f < grounds[k].accel_x.length; f++) {
                    var feature = [];
                    var magnitude = Math.sqrt(grounds[k].accel_x[f] * grounds[k].accel_x[f] + grounds[k].accel_y[f] * grounds[k].accel_y[f] + grounds[k].accel_z[f] * grounds[k].accel_z[f]);
                    feature.push(grounds[k].accel_x[f] / magnitude);
                    feature.push(grounds[k].accel_y[f] / magnitude);
                    feature.push(grounds[k].accel_z[f] / magnitude);
                    features.push(feature);
                }
                grounds[k].features = features;
            }

            // calculate dtw values
            var dtw_array = [];
            for(var i = 0; i < length; i++) {
                var dtw_values = [];
                for(var j = 0; j < length; j++) {
                    if(i === j) {
                        dtw_values.push(0);
                    }
                    else {
                        var value = calculateDTW(grounds[i].features, grounds[j].features);
                        dtw_values.push(value);
                    }
                }
                dtw_array.push(dtw_values);
            }
            console.log('DTW Values');
            console.log(dtw_array);

            //choose template
            var dtw_avg = [];
            for(i = 0; i < length; i++) {
                var sum = 0;
                for(j = 0; j <length; j++) {
                    sum += dtw_array[i][j];
                }
                dtw_avg.push(sum / (length-1)); // sigma g
            }

            //average
            console.log('AVG : ' + dtw_avg);
            var template_index = 0;
            var min = Number.POSITIVE_INFINITY;
            for(i = 0; i < length; i++) {
                if(min > dtw_avg[i]) {
                    template_index = i;
                    min = dtw_avg[i];
                }
            }
            console.log(template_index + ' : ' + min);

            var dtw_std = [];
            for(i = 0; i < length; i++) {
                sum = 0;
                for(j = 0; j < length; j++) {
                    if(i !== j) {
                        sum += (dtw_array[i][j] - dtw_avg[i]) * (dtw_array[i][j] - dtw_avg[i]);
                    }
                }
                dtw_std.push(Math.sqrt(sum / (length-2)));
            }
            console.log('DTW Std');
            console.log(dtw_std);

            Template.find({template_name: grounds[template_index].ground_name}).remove().exec();

            // save template
            var template = new Template();
            console.log('template save : ' + grounds[template_index].ground_name);
            template.template_name = grounds[template_index].ground_name;
            template.accel_x = grounds[template_index].accel_x;
            template.accel_y = grounds[template_index].accel_y;
            template.accel_z = grounds[template_index].accel_z;
            template.avg = dtw_avg[template_index];
            template.std = dtw_std[template_index];

            template.save(function(err) {
                if(err) {
                    console.log(err);
                    res.json({type: false});
                } else {
                    res.json({type: true});
                }
            });

        });
    }

});

function calculateDTW(ground1, ground2) {
    var state = {
      distanceCostMatrix: null,
      distance: function (x, y) {
          var sum_diff = 0;
          for(var i = 0; i < x.length; i++) {
              var difference = x[i] - y[i];
              sum_diff = sum_diff + (difference * difference);
          }
          var euclideanDistance = sum_diff;
          return euclideanDistance;
      }
    };

    var cost = Number.POSITIVE_INFINITY;
    cost = computeOptimalPath(ground1, ground2, state);
    return cost;
}

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
}

router.get('/get', function(req, res) {

    Template.find({}, function (err, templates) {
        if (err) return console.error(err);
        res.json({type: true, data: templates});
    });

});

router.post('/collection', function(req, res) {

    console.log('save_collection');

    var collection = new Collection();
    var date = new Date();
    collection.collection_id = date.getTime();
    collection.accel_x = req.body.data[0];
    collection.accel_y = req.body.data[1];
    collection.accel_z = req.body.data[2];

    collection.save(function(err) {
        if(err) {
            console.log(err);
            res.json({type: false});
        } else {
            res.json({type: true});
        }
    });

});

router.get('/getcollection', function(req, res) {

    console.log('get collection');

    Collection.find({}, function(err, collections) {
        if(err) {
            res.json({type: false});
        } else {
            if(collections) {
                console.log('successfully get collections');
                res.json({type: true, data: collections});
            } else {
                res.json({type: false});
            }
        }
    });

});


module.exports = router;