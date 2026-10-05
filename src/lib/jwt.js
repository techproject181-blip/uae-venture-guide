import { SignJWT, jwtVerify } from "jose";

// Kept apart from session.js so proxy.js can check tokens without loading the database code.
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export function signSessionToken(user) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user._id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** The token's payload, or null when the token is missing, expired or not signed by us. */
export async function verifySessionToken(token) {
  if (!token) return null;
  const key = secretKey(); // outside the try, so a missing secret is reported, not hidden
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
