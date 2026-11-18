import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import config from "./config.js";
import { HttpError } from "./lib/httpError.js";
import notifyRouter from "./routes/notify.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a few minutes." },
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", notifyRouter);

app.use((_req, _res, next) => next(new HttpError(404, "Not found.")));

// Central error handler: JSON { error } only, never a stack trace. Express spots error
// handlers by their four parameters, so _next must stay.
app.use((error, _req, res, _next) => {
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  // body-parser errors (bad JSON, body too large) carry their own 4xx status.
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: "Invalid request body." });
  }
  console.error("Unexpected error:", error);
  return res.status(500).json({ error: "Something went wrong." });
});

app.listen(config.port, () => {
  console.log(
    `notify-service listening on http://localhost:${config.port} ` +
      `(email ${config.email.enabled ? "ON" : "OFF — previews only"}, ` +
      `throttle ${config.throttleMinutes} min)`,
  );
});
