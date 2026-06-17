import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getImprint } from "@/lib/imprint";

// getImprint() reads IMPRINT_* (and one NEXT_PUBLIC_* fallback) from the
// environment on every call, so we snapshot and restore process.env around each
// test and exercise both the "forkable placeholder" and "configured" branches.
const IMPRINT_KEYS = [
  "IMPRINT_NAME",
  "IMPRINT_STREET",
  "IMPRINT_CITY",
  "IMPRINT_COUNTRY",
  "IMPRINT_EMAIL",
  "IMPRINT_PHONE",
  "IMPRINT_VAT_ID",
  "NEXT_PUBLIC_SITE_EMAIL",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const k of IMPRINT_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of IMPRINT_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("getImprint", () => {
  it("returns forkable placeholders and configured=false when nothing is set", () => {
    const imprint = getImprint();
    expect(imprint).toMatchObject({
      name: "Your Name",
      street: "Example Street 1",
      city: "12345 Example City",
      country: "Germany",
      email: "mail@example.com",
      phone: "",
      vatId: "",
      configured: false,
    });
  });

  it("flips configured=true only when a real name is provided", () => {
    process.env.IMPRINT_NAME = "Jane Doe";
    const imprint = getImprint();
    expect(imprint.name).toBe("Jane Doe");
    expect(imprint.configured).toBe(true);
  });

  it("uses provided values and trims surrounding whitespace", () => {
    process.env.IMPRINT_NAME = "  Jane Doe  ";
    process.env.IMPRINT_STREET = "Main St 5";
    process.env.IMPRINT_CITY = "10115 Berlin";
    process.env.IMPRINT_COUNTRY = "Deutschland";
    process.env.IMPRINT_EMAIL = "legal@example.org";
    process.env.IMPRINT_PHONE = "+49 30 123456";
    process.env.IMPRINT_VAT_ID = "DE123456789";
    expect(getImprint()).toEqual({
      name: "Jane Doe",
      street: "Main St 5",
      city: "10115 Berlin",
      country: "Deutschland",
      email: "legal@example.org",
      phone: "+49 30 123456",
      vatId: "DE123456789",
      configured: true,
    });
  });

  it("falls back to the public site email when no imprint email is set", () => {
    process.env.NEXT_PUBLIC_SITE_EMAIL = "hello@site.dev";
    expect(getImprint().email).toBe("hello@site.dev");
  });
});
