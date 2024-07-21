const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  filter: {
    type: String,
    required: true,
  },
  images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('List', ListSchema);
