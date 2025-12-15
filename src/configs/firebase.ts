import admin from "firebase-admin";

import logger from "../utils/logger.js";

try {
  admin.initializeApp();
  logger.info("Firebase Admin SDK init");
} catch (err) {
  logger.error("Firebase Admin error");
  process.exit(1);
}
