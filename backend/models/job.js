const mongoose = require("mongoose");
const jobSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  jobType: {
    type: String,
    required: true,
  },
  firm: {
    type: String,
    required: true,
  },
  descSubstring: {
    type: String,
  },
});

module.exports = mongoose.model("Job", jobSchema);
