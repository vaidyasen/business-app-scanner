import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { IconSymbol, ThemedText, ThemedView } from "@/src/shared/components";

export default function HomeScreen() {
  const handleScanDocument = () => {
    // Navigate to camera screen when implemented
    console.log("Navigate to camera scanner");
  };

  const handleViewDocuments = () => {
    // Navigate to documents screen when implemented
    console.log("Navigate to documents");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Scanner Pro
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Scan and digitize your documents with AI-powered OCR
        </ThemedText>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleScanDocument}
        >
          <IconSymbol size={48} color="#FFFFFF" name="camera" />
          <Text style={styles.primaryButtonText}>Scan Document</Text>
          <Text style={styles.buttonSubtext}>Take a photo to extract text</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewDocuments}
          >
            <IconSymbol size={32} color="#007AFF" name="folder" />
            <Text style={styles.secondaryButtonText}>My Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <IconSymbol size={32} color="#007AFF" name="photo" />
            <Text style={styles.secondaryButtonText}>From Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.features}>
        <ThemedText type="subtitle" style={styles.featuresTitle}>
          Features
        </ThemedText>

        <View style={styles.featureItem}>
          <IconSymbol size={24} color="#34C759" name="text.viewfinder" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold">AI Text Recognition</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Extract text from documents, receipts, and business cards
            </ThemedText>
          </View>
        </View>

        <View style={styles.featureItem}>
          <IconSymbol size={24} color="#FF9500" name="doc" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold">Document Management</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Organize and search through your scanned documents
            </ThemedText>
          </View>
        </View>

        <View style={styles.featureItem}>
          <IconSymbol size={24} color="#5AC8FA" name="square.and.arrow.up" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold">Export & Share</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Save as PDF or share extracted text easily
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  actionButtons: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  buttonSubtext: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  features: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginTop: 4,
  },
});
