import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, ref: "user", required: true },
  docId: { type: String, ref: "doctor", required: true },
  hospitalId: { type: String, ref: "hospital", default: "" },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  symptoms: { type: String, default: "" },
  notes: { type: String, default: "" },
  prescription: { type: String, default: "" },
  followUpDate: { type: String, default: "" },
  cancelled: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  rescheduled: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: "" },
  ratedAt: { type: Number },
});

const appointmentModel =
  mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
