import { connectDb } from "./config/db";
import { ENV } from "./config/env";
import { app } from "./app";

async function bootstrap(): Promise<void> {
  await connectDb();
  app.listen(ENV.port, () => {
    // Keep this log concise for local dev startup visibility.
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${ENV.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API", error);
  process.exit(1);
});
