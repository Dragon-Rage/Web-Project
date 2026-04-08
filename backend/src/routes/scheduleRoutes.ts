import { Router } from "express";
import {
  createSchedule,
  deleteSchedule,
  getScheduleById,
  getScheduleConflicts,
  getSchedules,
  updateSchedule,
} from "../controllers/scheduleController";

export const scheduleRouter = Router();

scheduleRouter.get("/", getSchedules);
scheduleRouter.get("/conflicts", getScheduleConflicts);
scheduleRouter.get("/:id", getScheduleById);
scheduleRouter.post("/", createSchedule);
scheduleRouter.put("/:id", updateSchedule);
scheduleRouter.delete("/:id", deleteSchedule);
