/**
 * Created by yuhwan on 2015. 8. 21..
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var invitationSchema = new Schema({
  invitation_id: { type: String, unique: true },
  invitation_time: {type: Date, default: Date.now},
  donghang_time: { type: Date, default: null},
  participants_id: [String],
  participants_status: [Boolean],
  participants_nickname: [String],
  invitation_status : { type: Boolean, default: false}
});

// the schema is useless so far
// we need to create a model using it
var Invitation = mongoose.model('Invitation', invitationSchema);

// make this available to our users in our Node applications
module.exports = Invitation;
