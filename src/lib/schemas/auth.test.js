import { describe, expect, test } from "vitest";
import { signUpSchema } from "@/lib/schemas/auth";
import { fieldErrors } from "@/lib/schemas/helpers";

const valid = { name: "Aisha Khan", email: " Aisha@Example.com ", password: "karak2026", role: "entrepreneur" };

describe("signUpSchema", () => {
  test("accepts a valid sign-up and stores the email in lower case", () => {
    expect(signUpSchema.parse(valid).email).toBe("aisha@example.com");
  });

  test("refuses the admin role, so nobody can sign up as an administrator", () => {
    const result = signUpSchema.safeParse({ ...valid, role: "admin" });
    expect(fieldErrors(result.error)).toEqual({ role: "Choose how you are joining." });
  });

  test.each([
    ["karak1", "Use at least 8 characters."],
    ["karakchai", "Include at least one number."],
    ["20262026", "Include at least one letter."],
  ])("refuses the weak password %s", (password, message) => {
    const result = signUpSchema.safeParse({ ...valid, password });
    expect(fieldErrors(result.error).password).toBe(message);
  });

  test("gives one message per field", () => {
    const result = signUpSchema.safeParse({ name: "", email: "not-an-email", password: "", role: "" });
    expect(Object.keys(fieldErrors(result.error))).toEqual(["name", "email", "password", "role"]);
  });
});
