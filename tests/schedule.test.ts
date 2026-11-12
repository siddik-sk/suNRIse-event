import { describe, expect, it } from "vitest";
import { findScheduleConflict } from "@/lib/registrations";

const base = { capacity: 50 };

type Slot = { id: string; title: string; day: number; startTime: string; endTime: string; capacity: number };

function slot(title: string, day: number, startTime: string, endTime: string): Slot {
  return { id: title, title, day, startTime, endTime, ...base };
}

describe("findScheduleConflict", () => {
  it("ignores events on different days", () => {
    expect(findScheduleConflict([slot("A", 1, "09:00", "11:00"), slot("B", 2, "09:00", "11:00")])).toBeNull();
  });

  it("allows back-to-back events", () => {
    expect(findScheduleConflict([slot("A", 1, "09:00", "11:00"), slot("B", 1, "11:00", "13:00")])).toBeNull();
  });

  it("detects a partial overlap", () => {
    const conflict = findScheduleConflict([slot("Hackathon", 1, "09:00", "13:00"), slot("Robotics", 1, "12:00", "14:00")]);
    expect(conflict).toContain("Hackathon");
    expect(conflict).toContain("Robotics");
  });

  it("detects a fully contained event", () => {
    expect(findScheduleConflict([slot("Outer", 2, "09:00", "18:00"), slot("Inner", 2, "10:00", "11:00")])).not.toBeNull();
  });

  it("detects an identical slot", () => {
    expect(findScheduleConflict([slot("A", 3, "15:00", "16:00"), slot("B", 3, "15:00", "16:00")])).not.toBeNull();
  });

  it("returns null for empty or single selections", () => {
    expect(findScheduleConflict([])).toBeNull();
    expect(findScheduleConflict([slot("A", 1, "09:00", "10:00")])).toBeNull();
  });

  it("handles unsorted input", () => {
    expect(
      findScheduleConflict([slot("Late", 1, "14:00", "16:00"), slot("Early", 1, "09:00", "10:30")]),
    ).toBeNull();
    expect(
      findScheduleConflict([slot("Late", 1, "10:00", "16:00"), slot("Early", 1, "09:00", "10:30")]),
    ).not.toBeNull();
  });
});
