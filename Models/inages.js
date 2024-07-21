const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Image', ImageSchema);
