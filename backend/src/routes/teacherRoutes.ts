import { Router } from "express";
import { getDomains, getSubjects, getTeacherById, getTeachers } from "../controllers/teacherController";

export const teacherRouter = Router();

teacherRouter.get("/", getTeachers);
teacherRouter.get("/domains", getDomains);
teacherRouter.get("/subjects", getSubjects);
teacherRouter.get("/:id", getTeacherById);
