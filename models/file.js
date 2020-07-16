const Joi = require('joi');
const mongoose = require('mongoose');

const File = mongoose.model('File', new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,

  },
  files: [{
    documentId: String,
    textId: String,
    keyWords: Array,
    allText: String
  }]

}));

function validateFile(file) {
  const schema = {
    user_id: Joi.string().required(),
    file_url: Joi.string().required()
  };

  return Joi.validate(file, schema);
}

exports.File = File;
exports.validate = validateFile;