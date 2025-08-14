import { useCamera } from "@/src/features/camera";
import { useOCR } from "@/src/features/ocr";
import { IconSymbol, ThemedText, ThemedView } from "@/src/shared/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();
  const { takePhoto, pickFromGallery, isLoading: cameraLoading } = useCamera();
  const { extractText, isProcessing } = useOCR();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (imageUri) {
        setCapturedImage(imageUri);
        await processImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
      console.error("Camera error:", error);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const imageUri = await pickFromGallery({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (imageUri) {
        setCapturedImage(imageUri);
        await processImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Gallery error:", error);
    }
  };

  const processImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await extractText(imageUri);
      setExtractedText(result?.text || "");
    } catch (error) {
      Alert.alert("Error", "Failed to extract text from image.");
      console.error("OCR error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedText("");
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    Alert.alert("Success", "Document saved successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  if (capturedImage) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol size={24} color="#007AFF" name="chevron.left" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Review Scan
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.analyzingText}>Extracting text...</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="subtitle" style={styles.textTitle}>
            Extracted Text
          </ThemedText>
          <View style={styles.textBox}>
            {extractedText ? (
              <Text style={styles.extractedText}>{extractedText}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                {isAnalyzing ? "Processing..." : "No text detected"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetake}
          >
            <IconSymbol size={20} color="#007AFF" name="camera" />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !extractedText && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!extractedText}
          >
            <IconSymbol size={20} color="#FFFFFF" name="checkmark" />
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol size={24} color="#007AFF" name="chevron.left" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Scan Document
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.viewfinder}>
          <View style={styles.scanningFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <Text style={styles.instructionText}>
            Position document within the frame
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handlePickFromGallery}
          disabled={cameraLoading}
        >
          <IconSymbol size={32} color="#007AFF" name="photo" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, cameraLoading && styles.disabledButton]}
          onPress={handleTakePhoto}
          disabled={cameraLoading}
        >
          {cameraLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  viewfinder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  scanningFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8 * 1.4, // A4-like ratio
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    paddingHorizontal: 32,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 32,
    backgroundColor: "#000000",
  },
  galleryButton: {
    padding: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  previewContainer: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  analyzingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
  textContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    maxHeight: 200,
  },
  textTitle: {
    marginBottom: 8,
  },
  textBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#000000",
  },
  placeholderText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
