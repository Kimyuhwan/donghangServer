/**
 * Created by yuhwan on 2015. 10. 11..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var templateSchema = new Schema({
  template_name: {type: String, unique: true},
  accel_x: [String],
  accel_y: [String],
  accel_z: [String],
  avg: Number,
  std: Number
});

// the schema is useless so far
// we need to create a model using it
var Template = mongoose.model('Template', templateSchema);

// make this available to our users in our Node applications
module.exports = Template;
