const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password:{type:String,require:true},
  appKey: { type: String, required: false },
  appSecret: { type: String, required: false },
  accessToken: { type: String, required: false },
  accessSecret: { type: String, required: false },
  chatId:{ type: String, required: false },
  Token:{ type: String, required: false },
  personality:{ type: String, required: false },
  schedule:{ type: String, required: false },


  
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;