import { cn } from "../cn";

describe("cn", () => {
  it("merges tailwind classes with conditional values", () => {
    const result = cn("flex", ["items-center", { hidden: false, block: true }], "px-2");

    expect(result).toContain("items-center");
    expect(result).toContain("block");
    expect(result).toContain("px-2");
    expect(result).not.toContain("hidden");
  });

  it("deduplicates conflicting classes using tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
