import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useHotelSearch } from "../hooks/useHotelSearch";

export const HotelSearchScreen = ({ onBackToCards }) => {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [activities, setActivities] = useState("");

  const { hotels, loading, error, searchHotels, saveContact } =
    useHotelSearch();

  const handleSearch = async () => {
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return;
    }

    const searchParams = {
      location: location.trim(),
      budget: budget ? parseInt(budget) : null,
      duration: duration ? parseInt(duration) : null,
      activities: activities ? activities.split(",").map((a) => a.trim()) : [],
    };

    await searchHotels(searchParams);
  };

  const handleContactManager = async (hotel) => {
    const { managerContact } = hotel;

    if (!managerContact) {
      Alert.alert(
        "Contact Info",
        "No manager contact available for this hotel"
      );
      return;
    }

    const options = [];

    if (managerContact.phone) {
      options.push({
        text: `📞 Call ${managerContact.name || "Manager"}`,
        onPress: () => Linking.openURL(`tel:${managerContact.phone}`),
      });
    }

    if (managerContact.email) {
      options.push({
        text: `📧 Email ${managerContact.name || "Manager"}`,
        onPress: () =>
          Linking.openURL(
            `mailto:${managerContact.email}?subject=Hotel Booking Inquiry`
          ),
      });
    }

    options.push({
      text: "💾 Save Contact",
      onPress: async () => {
        const saved = await saveContact(hotel);
        if (saved) {
          Alert.alert("Success", "Manager contact saved to your contacts!");
        }
      },
    });

    options.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert(
      "Contact Manager",
      `${managerContact.name || "Hotel Manager"}\n${
        managerContact.title || ""
      }\n\nContact for special rates and discounts!`,
      options
    );
  };

  const renderHotel = (hotel) => (
    <View key={hotel.id} style={styles.hotelCard}>
      <View style={styles.hotelHeader}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.hotelLocation}>{hotel.location}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {hotel.rating}</Text>
            {hotel.source === "local_card" && (
              <Text style={styles.localBadge}>📇 From Your Cards</Text>
            )}
          </View>
        </View>
        {hotel.image && (
          <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {typeof hotel.price === "number"
            ? `₹${hotel.price.toLocaleString()}/night`
            : hotel.price}
        </Text>
      </View>

      {hotel.amenities && (
        <View style={styles.amenitiesRow}>
          <Text style={styles.amenitiesLabel}>Amenities:</Text>
          <Text style={styles.amenities}>{hotel.amenities.join(", ")}</Text>
        </View>
      )}

      {hotel.activities && (
        <View style={styles.activitiesRow}>
          <Text style={styles.activitiesLabel}>Activities:</Text>
          <Text style={styles.activities}>{hotel.activities.join(", ")}</Text>
        </View>
      )}

      {hotel.managerContact && (
        <View style={styles.managerSection}>
          <Text style={styles.managerTitle}>Direct Manager Contact:</Text>
          <Text style={styles.managerName}>
            {hotel.managerContact.name || "Hotel Manager"}
          </Text>
          <Text style={styles.managerRole}>
            {hotel.managerContact.title || "Manager"}
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactManager(hotel)}
          >
            <Text style={styles.contactButtonText}>
              📞 Contact for Discounts
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToCards}>
          <Text style={styles.backButtonText}>← Back to Cards</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏨 Hotel Finder</Text>
        <Text style={styles.subtitle}>
          Find hotels + Direct manager contacts
        </Text>
      </View>

      <View style={styles.searchForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📍 Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Central Bangalore"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>💰 Budget per night (₹)</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g., 10000"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Duration (nights)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g., 3"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🎯 Activities (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={activities}
            onChangeText={setActivities}
            placeholder="e.g., Business Center, Pool, Spa"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? "🔍 Searching..." : "🔍 Find Hotels"}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {hotels.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            🎯 Top {hotels.length} Hotels Found
          </Text>
          <Text style={styles.resultsSubtitle}>
            Including direct manager contacts for better rates!
          </Text>

          {hotels.map(renderHotel)}
        </View>
      )}

      {!loading && hotels.length === 0 && location && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No hotels found for your criteria. Try adjusting your search
            parameters.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#e6f2ff",
  },
  searchForm: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  searchButtonDisabled: {
    backgroundColor: "#ccc",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#c62828",
    fontSize: 16,
    textAlign: "center",
  },
  resultsSection: {
    margin: 15,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  resultsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  hotelCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  hotelLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#f39c12",
    marginRight: 10,
  },
  localBadge: {
    fontSize: 12,
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
  priceRow: {
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  amenitiesRow: {
    marginBottom: 8,
  },
  amenitiesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  amenities: {
    fontSize: 14,
    color: "#666",
  },
  activitiesRow: {
    marginBottom: 15,
  },
  activitiesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  activities: {
    fontSize: 14,
    color: "#666",
  },
  managerSection: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  managerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  managerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  managerRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noResultsContainer: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
