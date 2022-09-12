const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// Virtual for genre's URL
GenreSchema.virtual('url').get(function () {
  return `/catalog/genre/` + this._id;
});

//Export model & Compile model from schema
module.exports = mongoose.model('Genre', GenreSchema);
