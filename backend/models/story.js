const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  imageUrl: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Story', StorySchema);