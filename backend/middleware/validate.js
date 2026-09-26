import { ApiError } from "../utils/ApiError.js";

/**
 * Validate request parts with zod schemas: validate({ body, query, params }).
 * The parsed body replaces req.body; query/params go to req.validated
 * (Express 5 exposes req.query as read-only).
 */
export const validate = (schemas) => (req, res, next) => {
  for (const part of ["params", "query", "body"]) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      const first = issues[0];
      const message = first.path ? `${first.path}: ${first.message}` : first.message;
      return next(ApiError.badRequest(message, issues));
    }

    if (part === "body") req.body = result.data;
    else req.validated = { ...req.validated, [part]: result.data };
  }
  next();
};
