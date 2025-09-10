// src/app/(frontend)/theme-boot.tsx
export function ThemeBoot() {
  // Renders a <script> tag that runs before hydration
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
            try {
              const storageKey = "theme";
              const user = localStorage.getItem(storageKey);
              const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              const theme = user || system;
              if (theme === "dark") document.documentElement.classList.add("dark");
              else document.documentElement.classList.remove("dark");
              // Set color-scheme only after hydration to avoid mismatch
              document.documentElement.style.colorScheme = theme;
            } catch (_) {}
          `,
      }}
    />
  )
}
