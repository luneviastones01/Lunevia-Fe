import { ReactNode, useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    try {
      localStorage.removeItem("lunevia_theme");
    } catch {
      // ignore
    }
  }, []);

  return <>{children}</>;
}
