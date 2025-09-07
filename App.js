import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MlkitOcr from "react-native-mlkit-ocr";
import { HotelSearchScreen } from "./src/features/hotels";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, recent, hasEmail, hasPhone
  const [currentScreen, setCurrentScreen] = useState("scanner"); // scanner, hotels

  React.useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const stored = await AsyncStorage.getItem("cards");
      if (stored) setCards(JSON.parse(stored));
    } catch (error) {
      console.error("Error loading cards:", error);
    }
  };

  // Real OCR with validation - extracts actual text from images
  const extractTextFromImage = async (imageUri) => {
    try {
      console.log("Starting real OCR extraction for:", imageUri);
      setOcrStatus("Analyzing image...");
      setOcrProgress(25);

      // Check if MLKit OCR is available (won't work in Expo Go)
      if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== "function") {
        console.log("MLKit OCR not available in Expo Go environment");
        setOcrProgress(50);
        setOcrStatus("OCR not available in this environment");

        return {
          rawText: "",
          extractedData: {},
          success: false,
          message:
            "Automatic text recognition requires a development build. For now, you can add text manually or save the image for reference.",
        };
      }

      // Use MLKit OCR to extract text from the image
      const result = await MlkitOcr.detectFromUri(imageUri);

      setOcrProgress(75);
      setOcrStatus("Processing extracted text...");

      if (result && result.length > 0) {
        // Extract all text blocks
        const extractedLines = result
          .map((block) => block.text)
          .filter((text) => text.trim().length > 0);

        if (extractedLines.length > 0) {
          const combinedText = extractedLines.join("\n");
          console.log("OCR extraction successful:", combinedText);

          setOcrProgress(100);
          setOcrStatus("Text extraction complete!");

          return {
            rawText: combinedText,
            extractedData: {},
            success: true,
          };
        }
      }

      // If no text was extracted
      console.log("No text could be extracted from the image");
      setOcrProgress(100);
      setOcrStatus("No text detected");

      return {
        rawText: "",
        extractedData: {},
        success: false,
        message:
          "No text could be detected in this image. The image might be blurry, have poor lighting, or contain no readable text.",
      };
    } catch (error) {
      console.error("OCR Error:", error);
      setOcrStatus("OCR failed");
      setOcrProgress(100);

      return {
        rawText: "",
        extractedData: {},
        success: false,
        message: `Text extraction failed: ${error.message}. Please ensure the image is clear and well-lit, or add text manually.`,
      };
    }
  };

  const parseBusinessCardText = (frontText, backText) => {
    // Combine and parse text from both sides
    const combinedText = `${frontText || ""}\n${backText || ""}`;
    const lines = combinedText.split("\n").filter((line) => line.trim());

    // Enhanced regex patterns for better extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const phoneRegex =
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const urlRegex =
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co)\b)/gi;
    const addressRegex =
      /\d+\s+[A-Za-z\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Plaza|Place|Pl)\b/gi;

    // Extract structured data
    const emails = [
      ...new Set(
        (combinedText.match(emailRegex) || []).map((email) =>
          email.toLowerCase()
        )
      ),
    ];
    const phones = [...new Set(combinedText.match(phoneRegex) || [])];
    const urls = [...new Set(combinedText.match(urlRegex) || [])];
    const addresses = [...new Set(combinedText.match(addressRegex) || [])];

    // Smart field detection
    let name = "";
    let title = "";
    let company = "";
    let department = "";

    // Common title keywords
    const titleKeywords = [
      "ceo",
      "cto",
      "cfo",
      "manager",
      "director",
      "president",
      "vice president",
      "vp",
      "engineer",
      "developer",
      "designer",
      "analyst",
      "consultant",
      "specialist",
      "coordinator",
      "assistant",
      "executive",
      "officer",
      "founder",
      "partner",
      "sales",
      "marketing",
      "hr",
      "human resources",
      "finance",
      "operations",
      "senior",
      "junior",
      "lead",
      "principal",
      "chief",
    ];

    // Company suffixes and indicators
    const companyKeywords = [
      "inc",
      "llc",
      "corp",
      "ltd",
      "company",
      "co",
      "corporation",
      "limited",
      "group",
      "holdings",
      "enterprises",
      "solutions",
      "services",
      "technologies",
      "tech",
      "systems",
      "consulting",
      "associates",
      "partners",
    ];

    // Department keywords
    const departmentKeywords = [
      "department",
      "dept",
      "division",
      "team",
      "unit",
      "group",
      "office",
    ];

    // Analyze each line for content type
    const analyzedLines = lines.map((line) => {
      const lowerLine = line.toLowerCase();
      const hasEmail = emailRegex.test(line);
      const hasPhone = phoneRegex.test(line);
      const hasUrl = urlRegex.test(line);
      const hasAddress = addressRegex.test(line);

      const hasTitle = titleKeywords.some((keyword) =>
        lowerLine.includes(keyword)
      );
      const hasCompany = companyKeywords.some((keyword) =>
        lowerLine.includes(keyword)
      );
      const hasDepartment = departmentKeywords.some((keyword) =>
        lowerLine.includes(keyword)
      );

      return {
        text: line,
        isEmail: hasEmail,
        isPhone: hasPhone,
        isUrl: hasUrl,
        isAddress: hasAddress,
        isTitle: hasTitle,
        isCompany: hasCompany,
        isDepartment: hasDepartment,
        isContact: hasEmail || hasPhone || hasUrl,
        isProbablyName:
          !hasEmail &&
          !hasPhone &&
          !hasUrl &&
          !hasTitle &&
          !hasCompany &&
          line.split(" ").length <= 4 &&
          line.length > 2,
        length: line.length,
      };
    });

    // Extract name (usually first non-contact, non-title line)
    const nameCandidate = analyzedLines.find(
      (line) =>
        line.isProbablyName &&
        !line.isContact &&
        line.length > 3 &&
        line.length < 50
    );
    if (nameCandidate) name = nameCandidate.text;

    // Extract title
    const titleCandidate = analyzedLines.find(
      (line) => line.isTitle && !line.isContact
    );
    if (titleCandidate) title = titleCandidate.text;

    // Extract company
    const companyCandidate = analyzedLines.find(
      (line) =>
        (line.isCompany ||
          (!line.isContact &&
            !line.isTitle &&
            !line.isProbablyName &&
            line.length > 5)) &&
        !line.isContact
    );
    if (companyCandidate) company = companyCandidate.text;

    // Extract department
    const departmentCandidate = analyzedLines.find((line) => line.isDepartment);
    if (departmentCandidate) department = departmentCandidate.text;

    // Organize by categories
    const organized = {
      personal: {
        name: name.trim(),
        title: title.trim(),
      },
      organization: {
        company: company.trim(),
        department: department.trim(),
      },
      contact: {
        emails,
        phones,
        urls,
        addresses,
      },
      metadata: {
        totalLines: lines.length,
        extractedFields: [name, title, company].filter((f) => f.trim()).length,
        contactMethods: emails.length + phones.length + urls.length,
      },
    };

    return {
      rawText: combinedText,
      organized,
      emails,
      phones,
      urls,
      addresses,
      lines,
      extractedData: {
        name: organized.personal.name,
        title: organized.personal.title,
        company: organized.organization.company,
        department: organized.organization.department,
        email: emails[0] || "",
        phone: phones[0] || "",
        website: urls[0] || "",
        address: addresses[0] || "",
      },
    };
  };

  const saveCard = async (frontImageUri, backImageUri, extractedText) => {
    try {
      const newCard = {
        id: Date.now().toString(),
        frontImage: frontImageUri,
        backImage: backImageUri,
        text: extractedText.rawText || extractedText,
        extractedData: extractedText.extractedData || {},
        organized: extractedText.organized || {},
        emails: extractedText.emails || [],
        phones: extractedText.phones || [],
        urls: extractedText.urls || [],
        addresses: extractedText.addresses || [],
        date: new Date().toISOString(),
      };
      const updated = [newCard, ...cards];
      setCards(updated);
      await AsyncStorage.setItem("cards", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving card:", error);
      Alert.alert("Error", "Failed to save card");
    }
  };

  // Delete card functionality
  const deleteCard = async (cardId) => {
    try {
      const updated = cards.filter((card) => card.id !== cardId);
      setCards(updated);
      await AsyncStorage.setItem("cards", JSON.stringify(updated));
      Alert.alert("Success", "Business card deleted successfully!");
    } catch (error) {
      console.error("Error deleting card:", error);
      Alert.alert("Error", "Failed to delete card");
    }
  };

  // Confirm delete with alert
  const confirmDeleteCard = (card) => {
    const cardName =
      card.organized?.personal?.name ||
      card.extractedData?.name ||
      card.organized?.organization?.company ||
      card.extractedData?.company ||
      "Unknown";

    Alert.alert(
      "Delete Business Card",
      `Are you sure you want to delete the card for "${cardName}"?\n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCard(card.id),
        },
      ]
    );
  };

  // Delete all cards functionality
  const deleteAllCards = async () => {
    try {
      setCards([]);
      await AsyncStorage.setItem("cards", JSON.stringify([]));
      Alert.alert("Success", "All business cards deleted successfully!");
    } catch (error) {
      console.error("Error deleting all cards:", error);
      Alert.alert("Error", "Failed to delete all cards");
    }
  };

  // Confirm delete all cards
  const confirmDeleteAllCards = () => {
    Alert.alert(
      "Delete All Business Cards",
      `Are you sure you want to delete ALL ${cards.length} business cards?\n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => deleteAllCards(),
        },
      ]
    );
  };

  // Filter and search functionality
  const getFilteredCards = () => {
    let filtered = [...cards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((card) => {
        const searchableText = [
          card.text || "",
          card.extractedData?.name || "",
          card.extractedData?.title || "",
          card.extractedData?.company || "",
          card.extractedData?.department || "",
          ...(card.emails || []),
          ...(card.phones || []),
          ...(card.urls || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Apply type filter
    switch (filterType) {
      case "recent":
        filtered = filtered.slice(0, 5);
        break;
      case "hasEmail":
        filtered = filtered.filter(
          (card) => card.emails && card.emails.length > 0
        );
        break;
      case "hasPhone":
        filtered = filtered.filter(
          (card) => card.phones && card.phones.length > 0
        );
        break;
      case "hasWebsite":
        filtered = filtered.filter((card) => card.urls && card.urls.length > 0);
        break;
      case "organized":
        filtered = filtered.filter(
          (card) =>
            card.organized &&
            (card.organized.personal?.name ||
              card.organized.organization?.company)
        );
        break;
    }

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
  };

  // Helper function for manual entry when OCR fails
  const continueWithManualEntry = async (frontImageUri, backImageUri) => {
    Alert.alert(
      "Manual Text Entry",
      "Since automatic text extraction failed, please enter the business card details manually:",
      [
        {
          text: "Skip - Save Image Only",
          style: "cancel",
          onPress: async () => {
            const fallbackText = `Business Card Image\nCaptured: ${new Date().toLocaleString()}\n\nAutomatic text extraction failed - image saved for reference.`;
            await saveCard(frontImageUri, backImageUri, {
              rawText: fallbackText,
            });
            Alert.alert("Saved", "Business card image saved successfully!");
            setLoading(false);
          },
        },
        {
          text: "Enter Text Manually",
          onPress: () => {
            Alert.prompt(
              "Enter Card Details",
              "Type the text from the business card (name, title, company, phone, email, etc.):",
              async (text) => {
                const manualText =
                  text && text.trim().length > 0
                    ? `${text.trim()}\n\n[Manually entered on ${new Date().toLocaleString()}]`
                    : `Business Card Image\nCaptured: ${new Date().toLocaleString()}\n\nNo text was entered - image saved for reference.`;

                const extractedText = parseBusinessCardText(manualText, "");
                await saveCard(frontImageUri, backImageUri, extractedText);
                Alert.alert(
                  "Success",
                  "Business card saved with manual text entry!"
                );
                setLoading(false);
              },
              "plain-text",
              "",
              "default"
            );
          },
        },
      ]
    );
  };

  const scanCard = async () => {
    setLoading(true);
    setOcrProgress(0);
    setOcrStatus("");
    try {
      // First, take front image
      Alert.alert(
        "Scan Business Card",
        "Take a clear photo of the FRONT side of the business card. The app will validate text extraction before proceeding.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Take Front Photo",
            onPress: async () => {
              try {
                const frontResult = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!frontResult.canceled) {
                  const frontImageUri = frontResult.assets[0].uri;

                  // IMMEDIATELY validate OCR on front image
                  setOcrStatus("Validating text extraction...");
                  const frontOCR = await extractTextFromImage(frontImageUri);

                  if (!frontOCR.success) {
                    // OCR failed - prompt to retake or continue with manual entry
                    const isExpoGoLimitation =
                      frontOCR.message.includes("development build");

                    Alert.alert(
                      isExpoGoLimitation
                        ? "OCR Not Available in Expo Go"
                        : "Text Extraction Failed",
                      `${frontOCR.message}\n\n${
                        isExpoGoLimitation
                          ? "You can still save the image and add text manually."
                          : "Would you like to retake the photo or continue anyway?"
                      }`,
                      [
                        ...(isExpoGoLimitation
                          ? []
                          : [
                              {
                                text: "Retake Photo",
                                onPress: () => {
                                  // Restart the scanning process
                                  setLoading(false);
                                  scanCard();
                                },
                              },
                            ]),
                        {
                          text: isExpoGoLimitation
                            ? "Add Text Manually"
                            : "Continue Anyway",
                          style: "cancel",
                          onPress: () => {
                            // Continue with manual entry
                            continueWithManualEntry(frontImageUri, null);
                          },
                        },
                      ]
                    );
                    return;
                  }

                  // OCR successful! Show extracted text and proceed
                  const previewText =
                    frontOCR.rawText.length > 100
                      ? frontOCR.rawText.substring(0, 100) + "..."
                      : frontOCR.rawText;

                  Alert.alert(
                    "Text Extracted Successfully! ✅",
                    `Preview: "${previewText}"\n\nNow take the back photo or skip to save.`,
                    [
                      {
                        text: "Skip Back Photo",
                        onPress: async () => {
                          try {
                            const extractedText = parseBusinessCardText(
                              frontOCR.rawText,
                              ""
                            );
                            await saveCard(frontImageUri, null, extractedText);
                            Alert.alert(
                              "Success",
                              "Business card saved with extracted text!"
                            );
                          } catch (error) {
                            console.error("Save Error:", error);
                            Alert.alert("Error", "Failed to save card");
                          }
                          setLoading(false);
                        },
                      },
                      {
                        text: "Take Back Photo",
                        onPress: async () => {
                          try {
                            const backResult =
                              await ImagePicker.launchCameraAsync({
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                              });

                            if (!backResult.canceled) {
                              const backImageUri = backResult.assets[0].uri;

                              try {
                                // Process OCR for back image
                                setOcrStatus("Processing back image...");
                                const backOCR = await extractTextFromImage(
                                  backImageUri
                                );

                                // Combine front and back text (front text is already validated)
                                const combinedText =
                                  frontOCR.rawText +
                                  "\n" +
                                  (backOCR.rawText || "");
                                const extractedText = parseBusinessCardText(
                                  frontOCR.rawText,
                                  backOCR.rawText || ""
                                );

                                await saveCard(
                                  frontImageUri,
                                  backImageUri,
                                  extractedText
                                );
                                Alert.alert(
                                  "Success",
                                  "Business card (front & back) saved with extracted text!"
                                );
                              } catch (error) {
                                console.error("Back processing error:", error);
                                // Still save with front text only
                                const extractedText = parseBusinessCardText(
                                  frontOCR.rawText,
                                  ""
                                );
                                await saveCard(
                                  frontImageUri,
                                  backImageUri,
                                  extractedText
                                );
                                Alert.alert(
                                  "Partial Success",
                                  "Card saved with front text only"
                                );
                              }
                            }
                            setLoading(false);
                          } catch (error) {
                            console.error("Error taking back picture:", error);
                            Alert.alert(
                              "Error",
                              "Failed to capture back image"
                            );
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }
              } catch (error) {
                console.error("Error taking front picture:", error);
                Alert.alert(
                  "Error",
                  "Failed to capture front image. Please try again."
                );
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in scan process:", error);
      Alert.alert("Error", "Failed to start scanning. Please try again.");
      setLoading(false);
    }
  };

  const importFromGallery = async () => {
    setLoading(true);
    setOcrProgress(0);
    setOcrStatus("");
    try {
      // First, import front image
      Alert.alert(
        "Import Business Card",
        "First, select the FRONT side image of the business card",
        [
          { text: "Cancel", style: "cancel", onPress: () => setLoading(false) },
          {
            text: "Select Front Image",
            onPress: async () => {
              try {
                const frontResult = await ImagePicker.launchImageLibraryAsync({
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!frontResult.canceled) {
                  const frontImageUri = frontResult.assets[0].uri;

                  // Now import back image
                  Alert.alert(
                    "Front Image Selected",
                    "Now, select the BACK side image (optional)",
                    [
                      {
                        text: "Skip Back",
                        onPress: async () => {
                          try {
                            // Process OCR for front image only
                            const frontOCR = await extractTextFromImage(
                              frontImageUri
                            );
                            const extractedText = parseBusinessCardText(
                              frontOCR.rawText,
                              ""
                            );

                            await saveCard(frontImageUri, null, extractedText);
                            Alert.alert(
                              "Success",
                              "Business card imported with text extracted!"
                            );
                          } catch (error) {
                            console.error("OCR Error:", error);
                            const fallbackText = `Business Card imported on ${new Date().toLocaleDateString()}\nFront image imported!\nText extraction in progress...`;
                            await saveCard(frontImageUri, null, {
                              rawText: fallbackText,
                            });
                            Alert.alert(
                              "Success",
                              "Business card imported successfully!"
                            );
                          }
                          setLoading(false);
                        },
                      },
                      {
                        text: "Select Back Image",
                        onPress: async () => {
                          try {
                            const backResult =
                              await ImagePicker.launchImageLibraryAsync({
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                              });

                            if (!backResult.canceled) {
                              const backImageUri = backResult.assets[0].uri;

                              try {
                                // Process OCR for both images
                                const frontOCR = await extractTextFromImage(
                                  frontImageUri
                                );
                                const backOCR = await extractTextFromImage(
                                  backImageUri
                                );
                                const extractedText = parseBusinessCardText(
                                  frontOCR.rawText,
                                  backOCR.rawText
                                );

                                await saveCard(
                                  frontImageUri,
                                  backImageUri,
                                  extractedText
                                );
                                Alert.alert(
                                  "Success",
                                  "Business card (front & back) imported with text extracted!"
                                );
                              } catch (ocrError) {
                                console.error("OCR Error:", ocrError);
                                const fallbackText = `Business Card imported on ${new Date().toLocaleDateString()}\nFront and back images imported!\nText extraction in progress...`;
                                await saveCard(frontImageUri, backImageUri, {
                                  rawText: fallbackText,
                                });
                                Alert.alert(
                                  "Success",
                                  "Business card imported successfully!"
                                );
                              }
                            }
                            setLoading(false);
                          } catch (error) {
                            console.error("Error importing back image:", error);
                            Alert.alert(
                              "Error",
                              "Failed to import back image. Saving front only."
                            );
                            const placeholderText = `Business Card imported on ${new Date().toLocaleDateString()}\nFront image imported!\nOCR functionality coming soon...`;
                            await saveCard(
                              frontImageUri,
                              null,
                              placeholderText
                            );
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                } else {
                  setLoading(false);
                }
              } catch (error) {
                console.error("Error importing front image:", error);
                Alert.alert(
                  "Error",
                  "Failed to import front image. Please try again."
                );
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in import process:", error);
      Alert.alert("Error", "Failed to start import. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === "scanner" && styles.activeTab]}
          onPress={() => setCurrentScreen("scanner")}
        >
          <Text
            style={[
              styles.tabText,
              currentScreen === "scanner" && styles.activeTabText,
            ]}
          >
            📷 Business Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === "hotels" && styles.activeTab]}
          onPress={() => setCurrentScreen("hotels")}
        >
          <Text
            style={[
              styles.tabText,
              currentScreen === "hotels" && styles.activeTabText,
            ]}
          >
            🏨 Hotel Search
          </Text>
        </TouchableOpacity>
      </View>

      {currentScreen === "scanner" ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Business Card Scanner</Text>
            <Text style={styles.subtitle}>
              Scan and organize your business cards
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.scanButton]}
              onPress={scanCard}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Processing..." : "📷 Scan Card"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.importButton]}
              onPress={importFromGallery}
              disabled={loading}
            >
              <Text style={styles.buttonText}>📁 Import from Gallery</Text>
            </TouchableOpacity>
          </View>

          {cards.length > 0 && (
            <View style={styles.cardsContainer}>
              {/* Search and Filter Section */}
              <View style={styles.searchFilterContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="🔍 Search cards..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "all" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("all")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "all" && styles.activeFilterText,
                      ]}
                    >
                      📋 All ({cards.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "recent" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("recent")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "recent" && styles.activeFilterText,
                      ]}
                    >
                      🕒 Recent
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "organized" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("organized")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "organized" && styles.activeFilterText,
                      ]}
                    >
                      ✨ Organized
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "hasEmail" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("hasEmail")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "hasEmail" && styles.activeFilterText,
                      ]}
                    >
                      📧 Email (
                      {cards.filter((c) => c.emails?.length > 0).length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "hasPhone" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("hasPhone")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "hasPhone" && styles.activeFilterText,
                      ]}
                    >
                      📱 Phone (
                      {cards.filter((c) => c.phones?.length > 0).length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterType === "hasWebsite" && styles.activeFilter,
                    ]}
                    onPress={() => setFilterType("hasWebsite")}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterType === "hasWebsite" && styles.activeFilterText,
                      ]}
                    >
                      🌐 Website (
                      {cards.filter((c) => c.urls?.length > 0).length})
                    </Text>
                  </TouchableOpacity>

                  {(searchQuery || filterType !== "all") && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearFilters}
                    >
                      <Text style={styles.clearButtonText}>✖️ Clear</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              <View style={styles.cardsHeader}>
                <Text style={styles.cardsTitle}>
                  Cards ({getFilteredCards().length}
                  {getFilteredCards().length !== cards.length
                    ? ` of ${cards.length}`
                    : ""}
                  )
                </Text>
                {cards.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={() => confirmDeleteAllCards()}
                  >
                    <Text style={styles.clearAllButtonText}>🗑️ Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.cardsList}>
                {getFilteredCards().map((card) => (
                  <View key={card.id} style={styles.cardItem}>
                    <View style={styles.cardImages}>
                      <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>Front</Text>
                        <Image
                          source={{ uri: card.frontImage || card.image }}
                          style={styles.cardImage}
                        />
                      </View>
                      {card.backImage && (
                        <View style={styles.imageContainer}>
                          <Text style={styles.imageLabel}>Back</Text>
                          <Image
                            source={{ uri: card.backImage }}
                            style={styles.cardImage}
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.cardInfo}>
                      {/* Display organized data if available */}
                      {card.organized &&
                      (card.organized.personal?.name ||
                        card.organized.organization?.company) ? (
                        <View style={styles.organizedInfo}>
                          {/* Personal Information Section */}
                          {(card.organized.personal?.name ||
                            card.organized.personal?.title) && (
                            <View style={styles.infoSection}>
                              <Text style={styles.sectionHeader}>
                                👤 Personal
                              </Text>
                              {card.organized.personal.name && (
                                <Text style={styles.nameText}>
                                  {card.organized.personal.name}
                                </Text>
                              )}
                              {card.organized.personal.title && (
                                <Text style={styles.titleText}>
                                  {card.organized.personal.title}
                                </Text>
                              )}
                            </View>
                          )}

                          {/* Organization Section */}
                          {(card.organized.organization?.company ||
                            card.organized.organization?.department) && (
                            <View style={styles.infoSection}>
                              <Text style={styles.sectionHeader}>
                                🏢 Organization
                              </Text>
                              {card.organized.organization.company && (
                                <Text style={styles.companyText}>
                                  {card.organized.organization.company}
                                </Text>
                              )}
                              {card.organized.organization.department && (
                                <Text style={styles.departmentText}>
                                  {card.organized.organization.department}
                                </Text>
                              )}
                            </View>
                          )}

                          {/* Contact Information Section */}
                          {card.organized.contact &&
                            (card.organized.contact.emails.length > 0 ||
                              card.organized.contact.phones.length > 0 ||
                              card.organized.contact.urls.length > 0 ||
                              card.organized.contact.addresses.length > 0) && (
                              <View style={styles.infoSection}>
                                <Text style={styles.sectionHeader}>
                                  📞 Contact
                                </Text>
                                {card.organized.contact.emails.map(
                                  (email, index) => (
                                    <Text
                                      key={`email-${index}`}
                                      style={styles.contactText}
                                    >
                                      📧 {email}
                                    </Text>
                                  )
                                )}
                                {card.organized.contact.phones.map(
                                  (phone, index) => (
                                    <Text
                                      key={`phone-${index}`}
                                      style={styles.contactText}
                                    >
                                      📱 {phone}
                                    </Text>
                                  )
                                )}
                                {card.organized.contact.urls.map(
                                  (url, index) => (
                                    <Text
                                      key={`url-${index}`}
                                      style={styles.contactText}
                                    >
                                      🌐 {url}
                                    </Text>
                                  )
                                )}
                                {card.organized.contact.addresses.map(
                                  (address, index) => (
                                    <Text
                                      key={`address-${index}`}
                                      style={styles.contactText}
                                    >
                                      📍 {address}
                                    </Text>
                                  )
                                )}
                              </View>
                            )}

                          {/* Metadata */}
                          {card.organized.metadata && (
                            <View style={styles.metadataSection}>
                              <Text style={styles.metadataText}>
                                📊 {card.organized.metadata.extractedFields}{" "}
                                fields •{" "}
                                {card.organized.metadata.contactMethods}{" "}
                                contacts
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : card.extractedData &&
                        Object.keys(card.extractedData).length > 0 ? (
                        <View style={styles.extractedInfo}>
                          {card.extractedData.name && (
                            <Text style={styles.nameText}>
                              👤 {card.extractedData.name}
                            </Text>
                          )}
                          {card.extractedData.title && (
                            <Text style={styles.titleText}>
                              💼 {card.extractedData.title}
                            </Text>
                          )}
                          {card.extractedData.company && (
                            <Text style={styles.companyText}>
                              🏢 {card.extractedData.company}
                            </Text>
                          )}
                          {card.emails && card.emails.length > 0 && (
                            <Text style={styles.contactText}>
                              📧 {card.emails[0]}
                            </Text>
                          )}
                          {card.phones && card.phones.length > 0 && (
                            <Text style={styles.contactText}>
                              📞 {card.phones[0]}
                            </Text>
                          )}
                          {card.urls && card.urls.length > 0 && (
                            <Text style={styles.contactText}>
                              🌐 {card.urls[0]}
                            </Text>
                          )}
                        </View>
                      ) : (
                        <Text style={styles.cardText} numberOfLines={4}>
                          {card.text}
                        </Text>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        {card.text && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                              Alert.alert("Raw Text", card.text, [
                                { text: "Close", style: "cancel" },
                              ])
                            }
                          >
                            <Text style={styles.actionButtonText}>
                              📄 Raw Text
                            </Text>
                          </TouchableOpacity>
                        )}

                        {(card.emails?.length > 0 ||
                          card.phones?.length > 0) && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                              const contactInfo = [
                                ...(card.emails || []).map(
                                  (email) => `📧 ${email}`
                                ),
                                ...(card.phones || []).map(
                                  (phone) => `📱 ${phone}`
                                ),
                                ...(card.urls || []).map((url) => `🌐 ${url}`),
                                ...(card.addresses || []).map(
                                  (address) => `📍 ${address}`
                                ),
                              ].join("\n");
                              Alert.alert("All Contact Info", contactInfo, [
                                { text: "Close", style: "cancel" },
                              ]);
                            }}
                          >
                            <Text style={styles.actionButtonText}>
                              📋 All Contacts
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Delete Button */}
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => confirmDeleteCard(card)}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              styles.deleteButtonText,
                            ]}
                          >
                            🗑️ Delete
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.cardDate}>
                        📅 {new Date(card.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {ocrStatus || "Processing..."}
              </Text>
              {ocrProgress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${ocrProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{ocrProgress}%</Text>
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <HotelSearchScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: "#007AFF",
  },
  importButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 15,
    width: "80%",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImages: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  cardInfo: {
    marginTop: 10,
  },
  organizedInfo: {
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  extractedInfo: {
    marginBottom: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  companyText: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
    fontWeight: "500",
  },
  departmentText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 3,
    lineHeight: 18,
  },
  metadataSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  metadataText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  actionButtonText: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#fee",
    borderColor: "#fcc",
  },
  deleteButtonText: {
    color: "#d32f2f",
  },
  expandButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  expandButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  cardText: { fontSize: 14, marginBottom: 5, lineHeight: 20 },
  cardDate: { fontSize: 12, color: "#888", marginTop: 8 },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearAllButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  clearAllButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardsContainer: {
    marginTop: 20,
    flex: 1,
  },
  searchFilterContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterText: {
    fontSize: 13,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  cardsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardsList: {
    flex: 1,
  },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 18, color: "#888", marginBottom: 5 },
  emptySubtext: { fontSize: 14, color: "#aaa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 10, textAlign: "center" },
  camera: { flex: 1 },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 50,
    paddingHorizontal: 50,
  },
  snapButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  snapText: { fontSize: 30 },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 25,
  },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
