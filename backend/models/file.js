const { text } = require('body-parser');
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  type:String,
  name:String,
  email:String,
  attempts:Number,
});

const Book = mongoose.model('forms', formSchema);
module.exports = Book;