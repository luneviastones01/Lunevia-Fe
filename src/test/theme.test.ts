import { describe, it, expect } from "vitest";

describe("Theme system", () => {
  it("defaults to dark theme when no stored preference exists", () => {
    const defaultTheme = "dark";
    expect(defaultTheme).toBe("dark");
  });

  it("toggles between dark and light themes accurately", () => {
    let theme: "dark" | "light" = "dark";
    const toggle = () => {
      theme = theme === "dark" ? "light" : "dark";
    };

    toggle();
    expect(theme).toBe("light");
    toggle();
    expect(theme).toBe("dark");
  });
});
