import { describe, expect, it } from "vitest";
import { readCollegeId, saveCollegeId, sanitizeFilename } from "@/lib/security/upload";
import { ApiError } from "@/lib/api";

async function expectApiError(promise: Promise<unknown>, code: string, status: number) {
  try {
    await promise;
    throw new Error("Expected the call to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe(code);
    expect((error as ApiError).status).toBe(status);
  }
}

describe("sanitizeFilename", () => {
  it("strips directory traversal and unsafe characters", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Users\\Sai\\college id.png")).toBe("college id.png");
    expect(sanitizeFilename("id<>.pdf")).toBe("id_.pdf");
  });

  it("falls back for empty input and truncates long names", () => {
    expect(sanitizeFilename("")).toBe("college-id");
    expect(sanitizeFilename(`${"a".repeat(200)}.png`).length).toBeLessThanOrEqual(120);
  });
});

describe("readCollegeId", () => {
  it("rejects traversal and invalid stored names", async () => {
    await expectApiError(readCollegeId("../secret"), "UPLOAD_INVALID", 400);
    await expectApiError(readCollegeId("nested/folder.png"), "UPLOAD_INVALID", 400);
    await expectApiError(readCollegeId(""), "UPLOAD_INVALID", 400);
  });

  it("returns not found for unknown files", async () => {
    await expectApiError(readCollegeId("does-not-exist-123.png"), "UPLOAD_NOT_FOUND", 404);
  });
});

describe("saveCollegeId", () => {
  it("rejects empty files", async () => {
    await expectApiError(saveCollegeId(new File([], "id.jpg", { type: "image/jpeg" })), "UPLOAD_EMPTY", 400);
  });

  it("rejects unsupported declared types", async () => {
    const file = new File(["hello"], "id.txt", { type: "text/plain" });
    await expectApiError(saveCollegeId(file), "UPLOAD_TYPE", 415);
  });

  it("rejects files whose magic bytes do not match the declared type", async () => {
    const fakePng = new File([new Uint8Array([0x47, 0x49, 0x46, 0x38])], "id.png", { type: "image/png" });
    await expectApiError(saveCollegeId(fakePng), "UPLOAD_MAGIC", 415);
  });

  it("rejects oversized files before reading them", async () => {
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "id.png", { type: "image/png" });
    await expectApiError(saveCollegeId(oversized), "UPLOAD_TOO_LARGE", 413);
  });
});
