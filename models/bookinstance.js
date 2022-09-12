const { DateTime } = require('luxon'); // Import Luxon
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  //reference to the associated book
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance',
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function () {
  return `/catalog/bookinstance/${this._id}`;
});

// virtual property for due_back_formatted
BookInstanceSchema.virtual('due_back_formatted').get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// virtual property for due_back_formatted for Book Instance Update page
BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate();
});

//Export model & Compile model from schema
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
