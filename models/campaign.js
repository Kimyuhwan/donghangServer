/**
 * Created by yuhwan on 2015. 8. 24..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var campaignSchema = new Schema({
  campaign_id: { type: Number, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  rep_picture: { type: String },
  rep_video: { type: String },
  num_of_participants: Number,
  participation: Boolean,
  ground_motion: [ Number ]
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('Campaign', campaignSchema);

// make this available to our users in our Node applications
module.exports = User;