import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
      applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
      },
      job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: function() {
                  return !this.internship; // Required if internship is not present
            }
      },
      internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: function() {
                  return !this.job; // Required if job is not present
            }
      },
      status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
      }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);