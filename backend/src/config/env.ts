import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const ENV = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI as string,
  dbName: process.env.DB_NAME ?? "teacher_scheduler",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
