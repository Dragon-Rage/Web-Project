import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Teacher } from "../models/Teacher";

export async function getTeachers(req: Request, res: Response): Promise<void> {
  const { domain, subject, active, day, page = "1", limit = "50" } = req.query;

  const query: FilterQuery<typeof Teacher> = {};

  if (domain) {
    query.domain = String(domain);
  }

  if (subject) {
    query.subjects = { $in: [String(subject)] };
  }

  if (active !== undefined) {
    query.isActive = String(active) === "true";
  }

  if (day) {
    query[`availability.${String(day).toLowerCase()}`] = { $exists: true, $ne: [] };
  }

  const pageNumber = Math.max(1, Number(page));
  const pageSize = Math.max(1, Math.min(100, Number(limit)));

  const [items, total] = await Promise.all([
    Teacher.find(query)
      .sort({ priority: 1, rating: -1, name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Teacher.countDocuments(query),
  ]);

  res.json({
    items,
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function getTeacherById(req: Request, res: Response): Promise<void> {
  const teacher = await Teacher.findById(req.params.id).lean();

  if (!teacher) {
    res.status(404).json({ message: "Teacher not found" });
    return;
  }

  res.json(teacher);
}

export async function getDomains(req: Request, res: Response): Promise<void> {
  const domains = await Teacher.distinct("domain", { isActive: true });
  res.json(domains.sort());
}

export async function getSubjects(req: Request, res: Response): Promise<void> {
  const domain = req.query.domain ? String(req.query.domain) : undefined;
  const query = domain ? { domain, isActive: true } : { isActive: true };

  const subjects = await Teacher.distinct("subjects", query);
  res.json(subjects.sort());
}
