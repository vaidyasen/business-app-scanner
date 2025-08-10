import MlkitOcr from "react-native-mlkit-ocr";
import { OCR_CONFIG } from "../../../shared/constants";
import { OCRResult, TextBlock } from "../../../shared/types";

export class OCRService {
  private static instance: OCRService;

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Extract text from image using ML Kit OCR
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      const result = await MlkitOcr.detectFromUri(imageUri);

      // Convert ML Kit result to our OCRResult format
      const blocks: TextBlock[] = result.map((block: any) => ({
        text: block.text,
        boundingBox: {
          x: block.bounding.left,
          y: block.bounding.top,
          width: block.bounding.width,
          height: block.bounding.height,
        },
        confidence: block.confidence || 1.0, // ML Kit doesn't provide confidence, so we default to 1.0
      }));

      const fullText = blocks.map((block) => block.text).join(" ");
      const averageConfidence =
        blocks.length > 0
          ? blocks.reduce((sum, block) => sum + block.confidence, 0) /
            blocks.length
          : 0;

      return {
        text: fullText,
        confidence: averageConfidence,
        blocks,
      };
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error(
        `OCR failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract text with filtering by confidence
   */
  async extractTextWithConfidence(
    imageUri: string,
    minConfidence: number = OCR_CONFIG.MIN_CONFIDENCE
  ): Promise<OCRResult> {
    try {
      const result = await this.extractTextFromImage(imageUri);

      // Filter blocks by confidence
      const filteredBlocks = result.blocks.filter(
        (block) => block.confidence >= minConfidence
      );

      const filteredText = filteredBlocks.map((block) => block.text).join(" ");
      const averageConfidence =
        filteredBlocks.length > 0
          ? filteredBlocks.reduce((sum, block) => sum + block.confidence, 0) /
            filteredBlocks.length
          : 0;

      return {
        text: filteredText,
        confidence: averageConfidence,
        blocks: filteredBlocks,
      };
    } catch (error) {
      console.error("Error extracting text with confidence filtering:", error);
      throw error;
    }
  }

  /**
   * Detect if image contains text
   */
  async hasText(imageUri: string): Promise<boolean> {
    try {
      const result = await this.extractTextFromImage(imageUri);
      return result.text.trim().length > 0;
    } catch (error) {
      console.error("Error checking if image has text:", error);
      return false;
    }
  }

  /**
   * Get text blocks sorted by position (top to bottom, left to right)
   */
  async extractTextBlocksSorted(imageUri: string): Promise<TextBlock[]> {
    try {
      const result = await this.extractTextFromImage(imageUri);

      // Sort blocks by vertical position first, then horizontal
      return result.blocks.sort((a, b) => {
        const yDiff = a.boundingBox.y - b.boundingBox.y;
        if (Math.abs(yDiff) > 10) {
          // If on different lines
          return yDiff;
        }
        return a.boundingBox.x - b.boundingBox.x; // Same line, sort by x
      });
    } catch (error) {
      console.error("Error extracting sorted text blocks:", error);
      throw error;
    }
  }

  /**
   * Extract text from specific region of image
   */
  async extractTextFromRegion(
    imageUri: string,
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): Promise<OCRResult> {
    try {
      const result = await this.extractTextFromImage(imageUri);

      // Filter blocks that intersect with the specified region
      const blocksInRegion = result.blocks.filter((block) => {
        const blockBox = block.boundingBox;

        // Check if block intersects with the region
        const intersects = !(
          blockBox.x + blockBox.width < region.x ||
          blockBox.x > region.x + region.width ||
          blockBox.y + blockBox.height < region.y ||
          blockBox.y > region.y + region.height
        );

        return intersects;
      });

      const regionText = blocksInRegion.map((block) => block.text).join(" ");
      const averageConfidence =
        blocksInRegion.length > 0
          ? blocksInRegion.reduce((sum, block) => sum + block.confidence, 0) /
            blocksInRegion.length
          : 0;

      return {
        text: regionText,
        confidence: averageConfidence,
        blocks: blocksInRegion,
      };
    } catch (error) {
      console.error("Error extracting text from region:", error);
      throw error;
    }
  }

  /**
   * Validate image before OCR processing
   */
  validateImage(imageUri: string): { isValid: boolean; error?: string } {
    if (!imageUri) {
      return { isValid: false, error: "Image URI is required" };
    }

    // Check if it's a valid URI format
    try {
      new URL(imageUri);
    } catch {
      // If not a valid URL, check if it's a local file path
      if (!imageUri.startsWith("file://") && !imageUri.startsWith("/")) {
        return { isValid: false, error: "Invalid image URI format" };
      }
    }

    // Check file extension
    const validExtensions = OCR_CONFIG.SUPPORTED_FORMATS;
    const extension = imageUri.split(".").pop()?.toLowerCase();

    if (!extension || !validExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `Unsupported format. Supported formats: ${validExtensions.join(
          ", "
        )}`,
      };
    }

    return { isValid: true };
  }
}
