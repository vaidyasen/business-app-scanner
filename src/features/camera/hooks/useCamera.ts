import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { CameraConfig } from "../../../shared/types";
import { CameraService } from "../services/CameraService";

interface UseCameraReturn {
  isLoading: boolean;
  takePhoto: (config?: Partial<CameraConfig>) => Promise<string | null>;
  pickFromGallery: (config?: Partial<CameraConfig>) => Promise<string | null>;
  processImage: (uri: string, options?: any) => Promise<string>;
  showImagePicker: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const cameraService = CameraService.getInstance();

  const takePhoto = useCallback(
    async (config?: Partial<CameraConfig>) => {
      try {
        setIsLoading(true);
        const imageUri = await cameraService.takePhoto(config);
        return imageUri;
      } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert(
          "Camera Error",
          error instanceof Error ? error.message : "Failed to take photo"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [cameraService]
  );

  const pickFromGallery = useCallback(
    async (config?: Partial<CameraConfig>) => {
      try {
        setIsLoading(true);
        const imageUri = await cameraService.pickFromGallery(config);
        return imageUri;
      } catch (error) {
        console.error("Error picking from gallery:", error);
        Alert.alert(
          "Gallery Error",
          error instanceof Error ? error.message : "Failed to pick image"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [cameraService]
  );

  const processImage = useCallback(
    async (uri: string, options?: any) => {
      try {
        setIsLoading(true);
        const processedUri = await cameraService.processImage(uri, options);
        return processedUri;
      } catch (error) {
        console.error("Error processing image:", error);
        Alert.alert(
          "Processing Error",
          error instanceof Error ? error.message : "Failed to process image"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [cameraService]
  );

  const showImagePicker = useCallback(() => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () => takePhoto(),
        },
        {
          text: "Gallery",
          onPress: () => pickFromGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  }, [takePhoto, pickFromGallery]);

  return {
    isLoading,
    takePhoto,
    pickFromGallery,
    processImage,
    showImagePicker,
  };
};
