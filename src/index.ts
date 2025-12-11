import { createApp } from "./app.js";
import env from "./configs/env.js";
import { pool } from "./db/index.js";

const startServer = async () => {
  const app = await createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`http://localhost:${env.PORT}/`);
    console.log(`http://localhost:${env.PORT}/docs`);
  });
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach(signal => {
    process.on(signal, () => {
      server.close(async (err) => {
        if (err) {
          process.exit(1);
        }
        try {
          await pool.end();
        } catch (err) {
          console.error("not finished db");
        }

        process.exit(0);
      });
    });
  });
};

if (env.NODE_ENV != "test") {
  startServer();
}
