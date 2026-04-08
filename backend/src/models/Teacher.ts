import { Schema, model } from "mongoose";

const availabilitySchema = new Schema(
  {
    monday: { type: [String], default: [] },
    tuesday: { type: [String], default: [] },
    wednesday: { type: [String], default: [] },
    thursday: { type: [String], default: [] },
    friday: { type: [String], default: [] },
  },
  { _id: false }
);

const teacherSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true, index: true },
    subjects: { type: [String], required: true, default: [], index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    availability: { type: availabilitySchema, required: true, default: () => ({}) },
    priority: { type: Number, required: true, min: 1, max: 5 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    maxHoursPerWeek: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

export const Teacher = model("Teacher", teacherSchema);
