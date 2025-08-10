import { Document, OCRResult } from "../types";

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Extract emails from text
 */
export const extractEmails = (text: string): string[] => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.match(emailRegex) || [];
};

/**
 * Extract phone numbers from text
 */
export const extractPhoneNumbers = (text: string): string[] => {
  const phoneRegex =
    /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  return text.match(phoneRegex) || [];
};

/**
 * Extract URLs from text
 */
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Calculate OCR confidence score
 */
export const calculateConfidence = (ocrResult: OCRResult): number => {
  if (!ocrResult.blocks || ocrResult.blocks.length === 0) return 0;

  const totalConfidence = ocrResult.blocks.reduce(
    (sum, block) => sum + block.confidence,
    0
  );

  return totalConfidence / ocrResult.blocks.length;
};

/**
 * Filter documents by search term
 */
export const filterDocuments = (
  documents: Document[],
  searchTerm: string
): Document[] => {
  if (!searchTerm.trim()) return documents;

  const term = searchTerm.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(term) ||
      doc.extractedText.toLowerCase().includes(term) ||
      doc.category?.toLowerCase().includes(term) ||
      doc.tags?.some((tag) => tag.toLowerCase().includes(term))
  );
};

/**
 * Sort documents by date
 */
export const sortDocumentsByDate = (
  documents: Document[],
  direction: "asc" | "desc" = "desc"
): Document[] => {
  return [...documents].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return direction === "desc" ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};
