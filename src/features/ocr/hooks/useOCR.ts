import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { OCRResult } from "../../../shared/types";
import { OCRService } from "../services/OCRService";

interface UseOCRReturn {
  isProcessing: boolean;
  extractText: (imageUri: string) => Promise<OCRResult | null>;
  extractTextWithConfidence: (
    imageUri: string,
    minConfidence?: number
  ) => Promise<OCRResult | null>;
  hasText: (imageUri: string) => Promise<boolean>;
  extractTextFromRegion: (
    imageUri: string,
    region: any
  ) => Promise<OCRResult | null>;
}

export const useOCR = (): UseOCRReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const ocrService = OCRService.getInstance();

  const extractText = useCallback(
    async (imageUri: string): Promise<OCRResult | null> => {
      try {
        setIsProcessing(true);

        // Validate image first
        const validation = ocrService.validateImage(imageUri);
        if (!validation.isValid) {
          Alert.alert(
            "Invalid Image",
            validation.error || "Please select a valid image"
          );
          return null;
        }

        const result = await ocrService.extractTextFromImage(imageUri);

        if (!result.text.trim()) {
          Alert.alert(
            "No Text Found",
            "No readable text was found in the image"
          );
          return null;
        }

        return result;
      } catch (error) {
        console.error("Error extracting text:", error);
        Alert.alert(
          "OCR Error",
          error instanceof Error
            ? error.message
            : "Failed to extract text from image"
        );
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [ocrService]
  );

  const extractTextWithConfidence = useCallback(
    async (
      imageUri: string,
      minConfidence?: number
    ): Promise<OCRResult | null> => {
      try {
        setIsProcessing(true);

        const validation = ocrService.validateImage(imageUri);
        if (!validation.isValid) {
          Alert.alert(
            "Invalid Image",
            validation.error || "Please select a valid image"
          );
          return null;
        }

        const result = await ocrService.extractTextWithConfidence(
          imageUri,
          minConfidence
        );

        if (!result.text.trim()) {
          Alert.alert(
            "Low Quality Text",
            "No high-confidence text was found. Try with better lighting or a clearer image."
          );
          return null;
        }

        return result;
      } catch (error) {
        console.error("Error extracting text with confidence:", error);
        Alert.alert(
          "OCR Error",
          error instanceof Error
            ? error.message
            : "Failed to extract text from image"
        );
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [ocrService]
  );

  const hasText = useCallback(
    async (imageUri: string): Promise<boolean> => {
      try {
        setIsProcessing(true);
        return await ocrService.hasText(imageUri);
      } catch (error) {
        console.error("Error checking for text:", error);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [ocrService]
  );

  const extractTextFromRegion = useCallback(
    async (
      imageUri: string,
      region: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    ): Promise<OCRResult | null> => {
      try {
        setIsProcessing(true);

        const validation = ocrService.validateImage(imageUri);
        if (!validation.isValid) {
          Alert.alert(
            "Invalid Image",
            validation.error || "Please select a valid image"
          );
          return null;
        }

        const result = await ocrService.extractTextFromRegion(imageUri, region);
        return result;
      } catch (error) {
        console.error("Error extracting text from region:", error);
        Alert.alert(
          "OCR Error",
          error instanceof Error
            ? error.message
            : "Failed to extract text from selected region"
        );
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [ocrService]
  );

  return {
    isProcessing,
    extractText,
    extractTextWithConfidence,
    hasText,
    extractTextFromRegion,
  };
};
