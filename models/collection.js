/**
 * Created by yuhwan on 2015. 10. 11..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var collectionSchema = new Schema({
  collection_id: {type: String, unique: true },
  accel_x: [String],
  accel_y: [String],
  accel_z: [String]
});

// the schema is useless so far
// we need to create a model using it
var Collection = mongoose.model('Collection', collectionSchema);

// make this available to our users in our Node applications
module.exports = Collection;
