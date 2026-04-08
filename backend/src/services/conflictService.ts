import { Types } from "mongoose";
import { Teacher } from "../models/Teacher";
import { ScheduleEntry } from "../models/Schedule";

export type ConflictSeverity = "error" | "warning";

export type ConflictItem = {
  severity: ConflictSeverity;
  code: string;
  message: string;
  entryIndexes?: number[];
};

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export async function detectConflicts(entries: ScheduleEntry[]): Promise<ConflictItem[]> {
  const conflicts: ConflictItem[] = [];

  for (let i = 0; i < entries.length; i += 1) {
    const current = entries[i];
    if (current.startSlot >= current.endSlot) {
      conflicts.push({
        severity: "error",
        code: "INVALID_SLOT_RANGE",
        message: `Entry ${i + 1} has invalid slot range`,
        entryIndexes: [i],
      });
    }

    for (let j = i + 1; j < entries.length; j += 1) {
      const compare = entries[j];
      if (current.day !== compare.day) {
        continue;
      }

      if (overlaps(current.startSlot, current.endSlot, compare.startSlot, compare.endSlot)) {
        if (String(current.teacherId) === String(compare.teacherId)) {
          conflicts.push({
            severity: "error",
            code: "TEACHER_OVERLAP",
            message: `Teacher assigned to overlapping slots on ${current.day}`,
            entryIndexes: [i, j],
          });
        }

        if (
          current.startSlot === compare.startSlot &&
          current.endSlot === compare.endSlot &&
          current.domain === compare.domain
        ) {
          conflicts.push({
            severity: "error",
            code: "DUPLICATE_SLOT",
            message: `Duplicate slot booking in ${current.domain} on ${current.day}`,
            entryIndexes: [i, j],
          });
        }
      }
    }
  }

  const teacherIds = [...new Set(entries.map((entry) => String(entry.teacherId)))].map((id) => new Types.ObjectId(id));
  const teachers = await Teacher.find({ _id: { $in: teacherIds } }).lean();
  const teacherById = new Map(teachers.map((teacher) => [String(teacher._id), teacher]));
  const loadMap = new Map<string, number>();

  entries.forEach((entry, index) => {
    const teacher = teacherById.get(String(entry.teacherId));

    if (!teacher) {
      conflicts.push({
        severity: "error",
        code: "TEACHER_NOT_FOUND",
        message: `Teacher not found for entry ${index + 1}`,
        entryIndexes: [index],
      });
      return;
    }

    if (!teacher.isActive) {
      conflicts.push({
        severity: "error",
        code: "INACTIVE_TEACHER",
        message: `${teacher.name} is inactive`,
        entryIndexes: [index],
      });
    }

    if (teacher.domain.toLowerCase() !== entry.domain.toLowerCase()) {
      conflicts.push({
        severity: "warning",
        code: "DOMAIN_MISMATCH",
        message: `${teacher.name} belongs to ${teacher.domain}, assigned to ${entry.domain}`,
        entryIndexes: [index],
      });
    }

    const duration = entry.endSlot - entry.startSlot;
    loadMap.set(String(entry.teacherId), (loadMap.get(String(entry.teacherId)) ?? 0) + duration);
  });

  loadMap.forEach((hours, teacherId) => {
    const teacher = teacherById.get(teacherId);
    if (!teacher) {
      return;
    }

    if (hours > teacher.maxHoursPerWeek) {
      conflicts.push({
        severity: "warning",
        code: "MAX_HOURS_EXCEEDED",
        message: `${teacher.name} exceeds max weekly hours (${hours}/${teacher.maxHoursPerWeek})`,
      });
    }
  });

  return conflicts;
}
