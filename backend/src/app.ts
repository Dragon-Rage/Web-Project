import cors from "cors";
import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import { scheduleRouter } from "./routes/scheduleRoutes";
import { teacherRouter } from "./routes/teacherRoutes";

export const app = express();

app.use(
  cors({
    origin: ENV.corsOrigin,
  })
);
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "teacher-scheduler-api" });
});

app.use("/api/teachers", teacherRouter);
app.use("/api/schedules", scheduleRouter);

app.use((error: Error, _req: Request, res: Response, _next: unknown) => {
  res.status(500).json({ message: error.message || "Internal server error" });
});
