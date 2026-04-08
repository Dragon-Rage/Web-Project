import mongoose from "mongoose";
import { ENV } from "./env";

export async function connectDb(): Promise<void> {
  await mongoose.connect(ENV.mongodbUri, {
    dbName: ENV.dbName,
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
