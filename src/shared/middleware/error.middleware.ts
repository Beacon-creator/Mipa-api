import { NextFunction, Request, Response } from "express";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("Error:", err);
  if (res.headersSent) return;
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
}
