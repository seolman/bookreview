import { collectDefaultMetrics, Registry } from "prom-client";

export const register = new Registry();

register.setDefaultLabels({
  appName: "manga-app",
});

collectDefaultMetrics({ register });
