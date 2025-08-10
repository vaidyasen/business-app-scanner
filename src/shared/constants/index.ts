import { AppTheme, CameraConfig } from "../types";

export const CAMERA_CONFIG: CameraConfig = {
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3],
  allowsMultipleSelection: false,
};

export const THEME: AppTheme = {
  colors: {
    primary: "#007AFF",
    secondary: "#5AC8FA",
    background: "#F2F2F7",
    surface: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

export const DARK_THEME: AppTheme = {
  ...THEME,
  colors: {
    primary: "#0A84FF",
    secondary: "#64D2FF",
    background: "#000000",
    surface: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    border: "#38383A",
    error: "#FF453A",
    success: "#30D158",
    warning: "#FF9F0A",
  },
};

export const OCR_CONFIG = {
  MIN_CONFIDENCE: 0.7,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ["jpg", "jpeg", "png", "webp"],
};

export const DOCUMENT_CATEGORIES = [
  { key: "receipt", label: "Receipt", icon: "receipt" },
  { key: "business-card", label: "Business Card", icon: "card" },
  { key: "document", label: "Document", icon: "document" },
  { key: "other", label: "Other", icon: "folder" },
] as const;

export const APP_CONFIG = {
  APP_NAME: "Scanner Pro",
  VERSION: "1.0.0",
  MAX_DOCUMENTS: 1000,
  AUTO_SAVE_DELAY: 2000, // ms
};
