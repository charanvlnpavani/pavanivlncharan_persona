import type { RequestHandler } from "express";
import type { z } from "zod";

/**
 * Parses and replaces req.body with the schema's output.
 * Invalid input throws a ZodError, which the error handler turns into a 400
 * listing each field problem.
 */
export const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    req.body = schema.parse(req.body ?? {});
    next();
  };
