import { Schema, model, Types } from "mongoose";

const scheduleEntrySchema = new Schema(
  {
    day: { type: String, required: true, enum: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    startSlot: { type: Number, required: true, min: 1 },
    endSlot: { type: Number, required: true, min: 1 },
    subject: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  },
  { _id: false }
);

const scheduleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ["draft", "confirmed"], default: "draft" },
    entries: { type: [scheduleEntrySchema], default: [] },
  },
  { timestamps: true }
);

export type ScheduleEntry = {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  startSlot: number;
  endSlot: number;
  subject: string;
  domain: string;
  teacherId: Types.ObjectId;
};

export const Schedule = model("Schedule", scheduleSchema);
