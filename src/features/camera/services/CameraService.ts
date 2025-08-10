import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { CAMERA_CONFIG } from "../../../shared/constants";
import { CameraConfig } from "../../../shared/types";

export class CameraService {
  private static instance: CameraService;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting media library permissions:", error);
      return false;
    }
  }

  /**
   * Take a photo using camera
   */
  async takePhoto(config: Partial<CameraConfig> = {}): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission not granted");
      }

      const finalConfig = { ...CAMERA_CONFIG, ...config };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: finalConfig.allowsEditing,
        aspect: finalConfig.aspect,
        quality: finalConfig.quality,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error("Error taking photo:", error);
      throw error;
    }
  }

  /**
   * Pick image from gallery
   */
  async pickFromGallery(
    config: Partial<CameraConfig> = {}
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error("Media library permission not granted");
      }

      const finalConfig = { ...CAMERA_CONFIG, ...config };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: finalConfig.allowsEditing,
        aspect: finalConfig.aspect,
        quality: finalConfig.quality,
        allowsMultipleSelection: finalConfig.allowsMultipleSelection,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error("Error picking from gallery:", error);
      throw error;
    }
  }

  /**
   * Process and optimize image
   */
  async processImage(
    uri: string,
    options: {
      resize?: { width: number; height: number };
      quality?: number;
      format?: ImageManipulator.SaveFormat;
      rotate?: number;
    } = {}
  ): Promise<string> {
    try {
      const actions: ImageManipulator.Action[] = [];

      if (options.resize) {
        actions.push({
          resize: {
            width: options.resize.width,
            height: options.resize.height,
          },
        });
      }

      if (options.rotate) {
        actions.push({
          rotate: options.rotate,
        });
      }

      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: options.quality || 0.8,
        format: options.format || ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  }

  /**
   * Crop image to specified dimensions
   */
  async cropImage(
    uri: string,
    cropData: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    }
  ): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: cropData.originX,
              originY: cropData.originY,
              width: cropData.width,
              height: cropData.height,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error("Error cropping image:", error);
      throw error;
    }
  }

  /**
   * Get image info
   */
  async getImageInfo(uri: string): Promise<{
    width: number;
    height: number;
    orientation?: number;
  }> {
    try {
      const info = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
      });

      // Get image dimensions (this is a simplified approach)
      // In a real app, you might want to use a more robust method
      return {
        width: info.width || 0,
        height: info.height || 0,
      };
    } catch (error) {
      console.error("Error getting image info:", error);
      throw error;
    }
  }
}
