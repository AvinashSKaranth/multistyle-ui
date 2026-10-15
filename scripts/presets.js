/* ===== Theme presets =====
 * Only the fields below are configurable. All other --t-* tokens are derived
 * by generator.js (hint/muted/disabled = 50% text; card-bg = surface;
 * card-border/surface-bg/brand-text from text+surface; status-text = status).
 *
 * dark.text/surface/cardSurface:
 *   null            -> HSL-invert from the light counterpart (default behavior)
 *   "<hex>"         -> explicit override (used by dark-native themes so their
 *                      already-dark light palette is not flipped to light)
 */

export const classic = {
  common: {
    primary: "#2563eb",
    secondary: "#3b82f6",
    info: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
    textOnPrimary: "#ffffff",
    buttonRadius: "8px",
    cardRadius: "12px",
    inputRadius: "8px",
    borderWidth: "1.5px",
  },
  light: { text: "#0f172a", surface: "#ffffff", cardSurface: "#f8fafc" },
  dark: { text: null, surface: null, cardSurface: null },
};

export const ocean = {
  common: {
    primary: "#0ea5e9", secondary: "#06b6d4",
    info: "#0ea5e9", success: "#22c55e", warning: "#eab308", error: "#f43f5e",
    textOnPrimary: "#ffffff",
    buttonRadius: "10px", cardRadius: "12px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#0c4a6e", surface: "#ffffff", cardSurface: "#e0f2fe" },
  dark: { text: null, surface: null, cardSurface: null },
};

export const forest = {
  common: {
    primary: "#22c55e", secondary: "#16a34a",
    info: "#06b6d4", success: "#16a34a", warning: "#eab308", error: "#ef4444",
    textOnPrimary: "#ffffff",
    buttonRadius: "8px", cardRadius: "12px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#14532d", surface: "#ffffff", cardSurface: "#dcfce7" },
  dark: { text: null, surface: null, cardSurface: null },
};

export const rose = {
  common: {
    primary: "#f43f5e", secondary: "#e11d48",
    info: "#fb7185", success: "#22c55e", warning: "#facc15", error: "#e11d48",
    textOnPrimary: "#ffffff",
    buttonRadius: "12px", cardRadius: "14px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#881337", surface: "#ffffff", cardSurface: "#ffe4e6" },
  dark: { text: null, surface: null, cardSurface: null },
};

// Dark-native: light mode is already dark; dark.* explicit so inversion does not flip to light.
export const midnight = {
  common: {
    primary: "#818cf8", secondary: "#6366f1",
    info: "#818cf8", success: "#4ade80", warning: "#facc15", error: "#fb7185",
    textOnPrimary: "#ffffff",
    buttonRadius: "8px", cardRadius: "12px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#e0e7ff", surface: "#1e1b4b", cardSurface: "#312e81" },
  dark: { text: "#e0e7ff", surface: "#0f0d2e", cardSurface: "#312e81" },
};

export const gold = {
  common: {
    primary: "#eab308", secondary: "#ca8a04",
    info: "#38bdf8", success: "#22c55e", warning: "#eab308", error: "#ef4444",
    textOnPrimary: "#ffffff",
    buttonRadius: "8px", cardRadius: "10px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#713f12", surface: "#ffffff", cardSurface: "#fef9c3" },
  dark: { text: null, surface: null, cardSurface: null },
};

export const slate = {
  common: {
    primary: "#64748b", secondary: "#475569",
    info: "#0ea5e9", success: "#22c55e", warning: "#facc15", error: "#f43f5e",
    textOnPrimary: "#ffffff",
    buttonRadius: "6px", cardRadius: "8px", inputRadius: "6px", borderWidth: "1px",
  },
  light: { text: "#1e293b", surface: "#ffffff", cardSurface: "#f1f5f9" },
  dark: { text: null, surface: null, cardSurface: null },
};

export const candy = {
  common: {
    primary: "#ec4899", secondary: "#f472b6",
    info: "#06b6d4", success: "#22c55e", warning: "#facc15", error: "#ec4899",
    textOnPrimary: "#ffffff",
    buttonRadius: "20px", cardRadius: "24px", inputRadius: "12px", borderWidth: "1.5px",
  },
  light: { text: "#831843", surface: "#ffffff", cardSurface: "#fce7f3" },
  dark: { text: null, surface: null, cardSurface: null },
};

// Dark-native
export const storm = {
  common: {
    primary: "#94a3b8", secondary: "#64748b",
    info: "#0ea5e9", success: "#22c55e", warning: "#facc15", error: "#fb7185",
    textOnPrimary: "#ffffff",
    buttonRadius: "6px", cardRadius: "10px", inputRadius: "6px", borderWidth: "1px",
  },
  light: { text: "#e2e8f0", surface: "#0f172a", cardSurface: "#334155" },
  dark: { text: "#e2e8f0", surface: "#0a0f1a", cardSurface: "#1e293b" },
};

// Dark-native
export const royal = {
  common: {
    primary: "#7c3aed", secondary: "#6d28d9",
    info: "#38bdf8", success: "#4ade80", warning: "#facc15", error: "#fb7185",
    textOnPrimary: "#ffffff",
    buttonRadius: "8px", cardRadius: "12px", inputRadius: "8px", borderWidth: "1.5px",
  },
  light: { text: "#ddd6fe", surface: "#2e1065", cardSurface: "#4c1d95" },
  dark: { text: "#ddd6fe", surface: "#1a0840", cardSurface: "#3b0764" },
};

/** All presets keyed by name. */
export const themes = {
  classic,
  ocean,
  forest,
  rose,
  midnight,
  gold,
  slate,
  candy,
  storm,
  royal,
};