/**
 * Created by yuhwan on 2015. 8. 21..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var codeSchema = new Schema({
  invitation_code: { type: String, unique: true },
  status: {type: Boolean, default: false},
  user_id : {type: String, required : true},
  user_nick_name : {type: String, required: true},
  sender_id : {type: String, required: true},
  sender_nick_name : {type: String, required: true}
});

// the schema is useless so far
// we need to create a model using it
var Code = mongoose.model('Code', codeSchema);

// make this available to our users in our Node applications
module.exports = Code;
