import AsyncStorage from "@react-native-async-storage/async-storage";

export class SimpleHotelService {
  // Simple mock hotel data - no external API calls
  static getMockHotels() {
    return [
      {
        id: "h1",
        name: "The Leela Palace Bangalore",
        location: "Central Bangalore",
        rating: 4.8,
        price: 15000,
        currency: "INR",
        amenities: ["Pool", "Spa", "Gym", "Restaurant"],
        activities: ["Business Center", "Conference Rooms"],
        source: "mock",
        managerContact: {
          name: "Raj Kumar",
          title: "General Manager",
          phone: "+91 98765 43210",
          email: "raj.kumar@leela.com",
          directContact: false,
        },
      },
      {
        id: "h2",
        name: "ITC Windsor",
        location: "Central Bangalore",
        rating: 4.7,
        price: 12000,
        currency: "INR",
        amenities: ["Pool", "Spa", "Business Center"],
        activities: ["Meeting Rooms", "Event Spaces"],
        source: "mock",
        managerContact: {
          name: "Priya Sharma",
          title: "Sales Manager",
          phone: "+91 98765 43211",
          email: "priya.sharma@itc.com",
          directContact: false,
        },
      },
      {
        id: "h3",
        name: "Taj West End",
        location: "Central Bangalore",
        rating: 4.6,
        price: 18000,
        currency: "INR",
        amenities: ["Pool", "Spa", "Tennis Court"],
        activities: ["Heritage Walks", "Cultural Events"],
        source: "mock",
        managerContact: {
          name: "Amit Singh",
          title: "Assistant Manager",
          phone: "+91 98765 43212",
          email: "amit.singh@taj.com",
          directContact: false,
        },
      },
    ];
  }

  static async searchHotels(searchParams) {
    try {
      console.log("Searching hotels with params:", searchParams);

      // Get mock data only
      const mockHotels = this.getMockHotels();

      // Simple filtering based on location
      const filteredHotels = mockHotels.filter((hotel) => {
        const locationMatch = hotel.location
          .toLowerCase()
          .includes(searchParams.location.toLowerCase());
        const budgetMatch =
          !searchParams.budget || hotel.price <= parseInt(searchParams.budget);

        return locationMatch && budgetMatch;
      });

      // Sort by rating
      const sortedHotels = filteredHotels.sort((a, b) => b.rating - a.rating);

      return sortedHotels.slice(0, 10); // Return top 10
    } catch (error) {
      console.error("Error in searchHotels:", error);
      return [];
    }
  }

  static async saveHotelContact(hotel) {
    try {
      console.log("Saving hotel contact:", hotel);

      // Simple contact saving without complex parsing
      const contactData = {
        id: Date.now().toString(),
        hotelId: hotel.id,
        hotelName: hotel.name,
        managerContact: hotel.managerContact,
        savedAt: new Date().toISOString(),
      };

      // Get existing contacts with safe parsing
      let existingContacts = [];
      try {
        const stored = await AsyncStorage.getItem("simple_hotel_contacts");
        if (stored) {
          existingContacts = JSON.parse(stored);
        }
      } catch (parseError) {
        console.log("Could not parse existing contacts, starting fresh");
        existingContacts = [];
      }

      // Ensure it's an array
      if (!Array.isArray(existingContacts)) {
        existingContacts = [];
      }

      // Add new contact
      existingContacts.push(contactData);

      // Save back to storage
      await AsyncStorage.setItem(
        "simple_hotel_contacts",
        JSON.stringify(existingContacts)
      );

      return contactData;
    } catch (error) {
      console.error("Error saving hotel contact:", error);
      throw error;
    }
  }

  static async getSavedContacts() {
    try {
      const stored = await AsyncStorage.getItem("simple_hotel_contacts");
      if (!stored) return [];

      const contacts = JSON.parse(stored);
      return Array.isArray(contacts) ? contacts : [];
    } catch (error) {
      console.error("Error getting saved contacts:", error);
      return [];
    }
  }
}
