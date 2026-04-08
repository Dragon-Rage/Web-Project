import { connectDb, disconnectDb } from "../config/db";
import { Teacher } from "../models/Teacher";
import { teacherSeedData } from "./teachers";

async function run(): Promise<void> {
  await connectDb();

  let inserted = 0;
  let updated = 0;

  for (const teacher of teacherSeedData) {
    const result = await Teacher.updateOne(
      { email: teacher.email },
      { $set: teacher },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted += 1;
    } else if (result.modifiedCount > 0 || result.matchedCount > 0) {
      updated += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Teacher seeding completed. inserted=${inserted} updated=${updated}`);
  await disconnectDb();
}

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", error);
  await disconnectDb();
  process.exit(1);
});
