import { describe, expect, test } from "vitest";
import { mentorProfileSchema } from "@/lib/schemas/community";
import { fieldErrors } from "@/lib/schemas/helpers";

const valid = {
  name: "Omar Haddad",
  headline: "Founder of two cafés in Dubai",
  bio: "Ten years of running food businesses across the UAE.",
  expertise: ["business_setup"],
  emirates: ["dubai"],
  yearsExperience: "10",
};

const notLinkedIn =
  "This is not a LinkedIn link. Use your profile address on linkedin.com, for example https://www.linkedin.com/in/your-name.";

describe("mentorProfileSchema linkedinUrl", () => {
  test.each(["https://www.linkedin.com/in/omar", "https://linkedin.com/in/omar", "https://ae.linkedin.com/in/omar"])(
    "accepts the LinkedIn address %s",
    (linkedinUrl) => {
      expect(mentorProfileSchema.parse({ ...valid, linkedinUrl }).linkedinUrl).toBe(linkedinUrl);
    },
  );

  test("may be left empty", () => {
    expect(mentorProfileSchema.parse({ ...valid, linkedinUrl: "" }).linkedinUrl).toBeUndefined();
  });

  test.each(["https://example.com/in/omar", "https://linkedin.com.example.com/in/omar", "https://notlinkedin.com/in/omar"])(
    "refuses %s, which is not on linkedin.com",
    (linkedinUrl) => {
      const result = mentorProfileSchema.safeParse({ ...valid, linkedinUrl });
      expect(fieldErrors(result.error).linkedinUrl).toBe(notLinkedIn);
    },
  );

  test("asks for a full address when the text is not a web address", () => {
    const result = mentorProfileSchema.safeParse({ ...valid, linkedinUrl: "linkedin.com/in/omar" });
    expect(fieldErrors(result.error).linkedinUrl).toBe("Enter your full LinkedIn address, starting with https://.");
  });
});
