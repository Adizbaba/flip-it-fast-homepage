
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    applyTheme(savedTheme || "system");
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    if (!newTheme) return;
    
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ToggleGroup 
      type="single" 
      value={theme} 
      onValueChange={handleThemeChange}
      className="border rounded-lg p-1"
    >
      <ToggleGroupItem 
        value="light" 
        aria-label="Light theme"
        className="data-[state=on]:bg-background"
      >
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="dark" 
        aria-label="Dark theme"
        className="data-[state=on]:bg-background"
      >
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="system" 
        aria-label="System theme"
        className="data-[state=on]:bg-background"
      >
        <Monitor className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ThemeToggle;
