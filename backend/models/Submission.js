const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: ["person", "company"],
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      file: {
        data: Buffer,
        contentType: String,
        name: String,
      },
    },
    {
      timestamps: true,
    }
  );

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;

