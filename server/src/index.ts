import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { libraryRouter } from "./routes/library.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true}));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/library", libraryRouter);

app.listen(3001, () => {
  console.log("SONORA server running on http://localhost:3001");
});