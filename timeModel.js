const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var timeStamp = new Schema({
  title : {type : String},
  id : { type : String},
  content : {type: String},
  time : { type : Date, default: Date.now },
  upfb : {type : Boolean,default:true}
})


module.exports = mongoose.model('Stamp', timeStamp);
