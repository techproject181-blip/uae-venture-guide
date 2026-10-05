import { getCurrentUser } from "@/lib/session";
import { fieldErrors } from "@/lib/schemas/helpers";

// Helpers that keep every API route short and consistent.

/** An error with an HTTP status. route() turns it into a JSON response. */
export class ApiError extends Error {
  constructor(status, message, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Wraps a Route Handler so any error becomes a clear JSON response instead of a crash. */
export function route(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: error.status });
      }
      // Mongoose throws a CastError when an id in the URL is not a valid id.
      if (error?.name === "CastError") {
        return Response.json({ error: "Not found." }, { status: 404 });
      }
      console.error(`${request.method} ${new URL(request.url).pathname} failed:`, error);
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

/** Reads the JSON body and checks it with a Zod schema. Throws a 400 listing the bad fields. */
export async function readBody(request, schema) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, "Please fix the highlighted fields.", fieldErrors(parsed.error));
  }
  return parsed.data;
}

/** The signed-in, active user. Pass roles to limit who may call the route, for example requireApiUser("admin"). */
export async function requireApiUser(...roles) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please sign in.");
  if (user.status !== "active") throw new ApiError(403, "Your account is not active yet.");
  if (roles.length > 0 && !roles.includes(user.role)) throw new ApiError(403, "You do not have access to this.");
  return user;
}

/** Like requireApiUser(), but a pending account is also let through (for the profile a mentor or funder fills in while waiting). */
export async function requireApiUserOrPending(...roles) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please sign in.");
  if (user.status === "suspended") throw new ApiError(403, "Your account is suspended.");
  if (roles.length > 0 && !roles.includes(user.role)) throw new ApiError(403, "You do not have access to this.");
  return user;
}

/** Converts Mongoose documents (with ObjectIds and Dates) into plain JSON-safe objects. */
export function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}
