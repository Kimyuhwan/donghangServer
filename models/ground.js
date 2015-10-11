/**
 * Created by yuhwan on 2015. 9. 13..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var groundSchema = new Schema({
  ground_id: {type: String, unique: true },
  ground_name: {type: String},
  accel_x: [String],
  accel_y: [String],
  accel_z: [String]
});

// the schema is useless so far
// we need to create a model using it
var Ground = mongoose.model('Ground', groundSchema);

// make this available to our users in our Node applications
module.exports = Ground;
