import { useEffect } from "react";
import { useTheme } from "next-themes";

type ThemePref = "light" | "dark" | "system";
type ThemeMode = "light" | "dark";

interface ThemeChangedMessage {
  type: "APP_THEME_CHANGED";
  theme?: ThemePref;
  resolvedTheme?: ThemeMode;
}

function isThemePref(value: unknown): value is ThemePref {
  return value === "light" || value === "dark" || value === "system";
}

function isResolvedTheme(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function resolveThemeMode(
  theme: unknown,
  resolvedTheme: unknown
): ThemeMode | null {
  if (isResolvedTheme(theme)) return theme;
  if (theme === "system" && isResolvedTheme(resolvedTheme)) return resolvedTheme;
  if (!isThemePref(theme) && isResolvedTheme(resolvedTheme)) return resolvedTheme;
  return null;
}

function applyDocumentThemeMode(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.setAttribute("data-theme-mode", mode);
}

/**
 * Syncs the dashboard theme with the parent frame (the agent-builder
 * platform that loads this skeleton in an iframe).
 *
 * Behaviour:
 *   - Reads `theme`, `resolvedTheme`, and `parentOrigin` from URL params
 *     on mount and applies the parent-resolved light/dark mode via
 *     `useTheme().setTheme()` (which writes localStorage + toggles the
 *     `dark` class on <html>).
 *   - Listens for `APP_THEME_CHANGED` postMessage events from the parent
 *     and re-applies the parent-resolved mode whenever the parent's mode
 *     changes. If the parent theme is `system`, `resolvedTheme` is
 *     authoritative so the iframe does not fall back to its own OS theme.
 *   - If `parentOrigin` URL param is present, only messages from that
 *     origin are accepted (defence against arbitrary frames postMessaging).
 *
 * When the dashboard is opened standalone (no `theme` param, no parent
 * sending messages), this hook is a no-op and the ThemeProvider's
 * `enableSystem` default takes over.
 *
 * A short inline boot script in `client/index.html` applies the initial
 * theme to <html> BEFORE React mounts, to prevent a brief flash of the
 * wrong theme on first paint.
 */
export function IframeThemeSync(): null {
  const { setTheme } = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialTheme = params.get("theme");
    const initialResolved = params.get("resolvedTheme");
    const parentOrigin = params.get("parentOrigin");

    const initialMode = resolveThemeMode(initialTheme, initialResolved);
    if (initialMode) {
      applyDocumentThemeMode(initialMode);
      setTheme(initialMode);
    }

    const handleMessage = (event: MessageEvent) => {
      if (parentOrigin && event.origin !== parentOrigin) return;
      const data = event.data as ThemeChangedMessage | undefined;
      if (!data || data.type !== "APP_THEME_CHANGED") return;

      const mode = resolveThemeMode(data.theme, data.resolvedTheme);
      if (!mode) return;

      applyDocumentThemeMode(mode);
      setTheme(mode);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setTheme]);

  return null;
}
