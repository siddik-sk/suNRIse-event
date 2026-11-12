import { describe, expect, it } from "vitest";
import { absoluteUrl, clamp, initials, maskEmail, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Hack the Grid")).toBe("hack-the-grid");
    expect(slugify("  Code & Carnival!! ")).toBe("code-carnival");
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("handles empty and very long input", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("a".repeat(200)).length).toBe(80);
  });
});

describe("maskEmail", () => {
  it("keeps the first two characters and the domain", () => {
    expect(maskEmail("student@sunriseevent.in")).toBe("st*****@sunriseevent.in");
    expect(maskEmail("ab@x.com")).toBe("ab**@x.com");
  });

  it("handles malformed values", () => {
    expect(maskEmail("not-an-email")).toBe("***");
  });
});

describe("initials", () => {
  it("uses the first two words", () => {
    expect(initials("Sai Kumar")).toBe("SK");
    expect(initials("  nri   university  ")).toBe("NU");
    expect(initials("Prince")).toBe("P");
    expect(initials("")).toBe("");
  });
});

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("absoluteUrl", () => {
  it("joins paths to the configured base", () => {
    expect(absoluteUrl("/events")).toMatch(/^https?:\/\/.+\/events$/);
    expect(absoluteUrl("faq")).toMatch(/^https?:\/\/.+\/faq$/);
  });
});
