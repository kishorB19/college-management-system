const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  subject: { type: String, required: true },
  marks: { type: Number, required: true },
  max_marks: { type: Number, default: 100 },
  exam_type: { type: String, default: 'Mid-Term' },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Result', resultSchema);
