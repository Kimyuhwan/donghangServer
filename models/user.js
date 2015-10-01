/**
 * Created by yuhwan on 2015. 8. 21..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  id: { type: String, unique: true },
  nickname: { type: String, required: true },
  password: { type: String, required: true },
  token: String,
  push_token : String,
  platform: Number
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
