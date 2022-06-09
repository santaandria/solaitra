// Defines the schema for the document

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, minLength: 5, required: true }, // Data validation in mongoose
  date: { type: Date, required: true },
  important: Boolean,
});

// ! Modify the schema so that the returned object has a specific structure
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

//! Note is the singular name of the model. Mongoose AUTO-PLURALIZE it to notes to refer to the document
module.exports = mongoose.model('Note', noteSchema);
