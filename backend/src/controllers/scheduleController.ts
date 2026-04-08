import { Request, Response } from "express";
import { Schedule } from "../models/Schedule";
import { detectConflicts } from "../services/conflictService";

function hasBlockingConflicts(conflicts: Awaited<ReturnType<typeof detectConflicts>>): boolean {
  return conflicts.some((item) => item.severity === "error");
}

export async function getSchedules(req: Request, res: Response): Promise<void> {
  const schedules = await Schedule.find().sort({ updatedAt: -1 }).lean();
  res.json(schedules);
}

export async function getScheduleById(req: Request, res: Response): Promise<void> {
  const schedule = await Schedule.findById(req.params.id).lean();
  if (!schedule) {
    res.status(404).json({ message: "Schedule not found" });
    return;
  }

  res.json(schedule);
}

export async function createSchedule(req: Request, res: Response): Promise<void> {
  const entries = req.body.entries ?? [];
  const conflicts = await detectConflicts(entries);

  if (hasBlockingConflicts(conflicts)) {
    res.status(400).json({ message: "Schedule has blocking conflicts", conflicts });
    return;
  }

  const schedule = await Schedule.create({
    name: req.body.name,
    status: req.body.status ?? "draft",
    entries,
  });

  res.status(201).json({ schedule, conflicts });
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  const entries = req.body.entries ?? [];
  const conflicts = await detectConflicts(entries);

  if (hasBlockingConflicts(conflicts)) {
    res.status(400).json({ message: "Schedule has blocking conflicts", conflicts });
    return;
  }

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      status: req.body.status,
      entries,
    },
    { new: true, runValidators: true }
  );

  if (!schedule) {
    res.status(404).json({ message: "Schedule not found" });
    return;
  }

  res.json({ schedule, conflicts });
}

export async function deleteSchedule(req: Request, res: Response): Promise<void> {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) {
    res.status(404).json({ message: "Schedule not found" });
    return;
  }

  res.status(204).send();
}

export async function getScheduleConflicts(req: Request, res: Response): Promise<void> {
  const scheduleId = req.query.scheduleId ? String(req.query.scheduleId) : undefined;

  if (!scheduleId) {
    res.status(400).json({ message: "scheduleId query param is required" });
    return;
  }

  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) {
    res.status(404).json({ message: "Schedule not found" });
    return;
  }

  const conflicts = await detectConflicts(schedule.entries as never[]);
  res.json({ scheduleId, conflicts });
}
