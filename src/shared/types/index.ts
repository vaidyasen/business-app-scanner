// Shared type definitions for the app

export interface Document {
  id: string;
  title: string;
  content: string;
  extractedText: string;
  imageUri: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
}

export interface CameraConfig {
  quality: number;
  allowsEditing: boolean;
  aspect: [number, number];
  allowsMultipleSelection: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScanResult {
  imageUri: string;
  ocrResult: OCRResult;
  document: Partial<Document>;
}

export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface NavigationParams {
  Scanner: undefined;
  Documents: undefined;
  DocumentDetail: { documentId: string };
  Settings: undefined;
}

export type ScanMode = "auto" | "manual";
export type DocumentCategory =
  | "receipt"
  | "business-card"
  | "document"
  | "other";
