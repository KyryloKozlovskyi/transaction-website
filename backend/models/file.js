const { text } = require('body-parser');
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
  type: String,
  attempts: Number,
  fileId: mongoose.Schema.Types.ObjectId,
});

const Form = mongoose.model('forms', formSchema);
module.exports = Form;