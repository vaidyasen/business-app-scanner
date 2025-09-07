// Hotel booking and sea  static async getLocalHotelCards() {
    try {
      const stored = await AsyncStorage.getItem('businessCards');
      if (!stored) {
        console.log('No business cards found in storage');
        return [];
      }
      
      let allCards;
      try {
        allCards = JSON.parse(stored);
      } catch (parseError) {
        console.error('Error parsing stored business cards:', parseError);
        return [];
      }
      
      if (!Array.isArray(allCards)) {
        console.log('Stored data is not an array');
        return [];
      }rvice
import AsyncStorage from '@react-native-async-storage/async-storage';

export class HotelService {
  static async searchHotels(searchParams) {
    try {
      const { location, budget, duration, activities } = searchParams;
      
      // First check local business cards for hotels
      const localHotels = await this.getLocalHotelCards();
      
      // Then fetch from online APIs
      const onlineHotels = await this.fetchOnlineHotels(searchParams);
      
      // Combine and rank results
      const combinedResults = this.combineAndRankHotels(localHotels, onlineHotels, searchParams);
      
      return combinedResults.slice(0, 10); // Top 10 results
    } catch (error) {
      console.error('Hotel search error:', error);
      throw error;
    }
  }

  static async getLocalHotelCards() {
    try {
      const stored = await AsyncStorage.getItem('cards');
      if (!stored) return [];
      
      const allCards = JSON.parse(stored);
      
      // Filter cards that are likely hotels based on keywords
      const hotelKeywords = [
        'hotel', 'resort', 'inn', 'lodge', 'suites', 'hospitality',
        'accommodation', 'guest house', 'motel', 'villa', 'stay',
        'manager', 'reception', 'booking', 'reservation'
      ];
      
      return allCards.filter(card => {
        const text = (card.text || '').toLowerCase();
        const company = (card.extractedData?.company || '').toLowerCase();
        const title = (card.extractedData?.title || '').toLowerCase();
        
        return hotelKeywords.some(keyword => 
          text.includes(keyword) || 
          company.includes(keyword) || 
          title.includes(keyword)
        );
      }).map(card => ({
        id: card.id,
        name: card.extractedData?.company || 'Hotel',
        managerName: card.extractedData?.name,
        managerTitle: card.extractedData?.title,
        phone: card.phones?.[0] || card.extractedData?.phone,
        email: card.emails?.[0] || card.extractedData?.email,
        address: card.extractedData?.address,
        source: 'local_card',
        businessCard: card,
        rating: 4.0, // Default rating for local cards
        price: 'Contact for rates',
        image: card.frontImage || card.image,
        managerContact: {
          name: card.extractedData?.name,
          title: card.extractedData?.title,
          phone: card.phones?.[0],
          email: card.emails?.[0],
          directContact: true
        }
      }));
    } catch (error) {
      console.error('Error getting local hotel cards:', error);
      return [];
    }
  }

  static async fetchOnlineHotels(searchParams) {
    try {
      // Mock data for demonstration - no network calls to avoid DOCTYPE errors
      console.log('Fetching mock hotels for:', searchParams);
      
      const mockHotels = [
        {
          id: 'h1',
          name: 'The Leela Palace Bangalore',
          location: 'Central Bangalore',
          rating: 4.8,
          price: 15000,
          currency: 'INR',
          image: 'https://example.com/leela.jpg',
          amenities: ['Pool', 'Spa', 'Gym', 'Restaurant'],
          activities: ['Business Center', 'Conference Rooms'],
          source: 'online',
          managerContact: {
            name: 'Raj Kumar',
            title: 'General Manager',
            phone: '+91 98765 43210',
            email: 'raj.kumar@leela.com',
            directContact: false
          }
        },
        {
          id: 'h2',
          name: 'ITC Windsor',
          location: 'Central Bangalore',
          rating: 4.7,
          price: 12000,
          currency: 'INR',
          image: 'https://example.com/itc.jpg',
          amenities: ['Pool', 'Spa', 'Business Center'],
          activities: ['Meeting Rooms', 'Event Spaces'],
          source: 'online',
          managerContact: {
            name: 'Priya Sharma',
            title: 'Sales Manager',
            phone: '+91 98765 43211',
            email: 'priya.sharma@itc.com',
            directContact: false
          }
        },
        {
          id: 'h3',
          name: 'Taj West End',
          location: 'Central Bangalore',
          rating: 4.9,
          price: 18000,
          currency: 'INR',
          image: 'https://example.com/taj.jpg',
          amenities: ['Heritage Property', 'Pool', 'Multiple Restaurants'],
          activities: ['Garden Walks', 'Cultural Programs'],
          source: 'online',
          managerContact: {
            name: 'Arun Mehta',
            title: 'Front Office Manager',
            phone: '+91 98765 43212',
            email: 'arun.mehta@taj.com',
            directContact: false
          }
        },
        {
          id: 'h4',
          name: 'The Oberoi Bangalore',
          location: 'Central Bangalore',
          rating: 4.8,
          price: 16000,
          currency: 'INR',
          image: 'https://example.com/oberoi.jpg',
          amenities: ['Luxury Spa', 'Fine Dining', 'Butler Service'],
          activities: ['Yoga Classes', 'Cooking Classes'],
          source: 'online',
          managerContact: {
            name: 'Sneha Patel',
            title: 'Guest Relations Manager',
            phone: '+91 98765 43213',
            email: 'sneha.patel@oberoi.com',
            directContact: false
          }
        },
        {
          id: 'h5',
          name: 'Shangri-La Bangalore',
          location: 'Central Bangalore',
          rating: 4.6,
          price: 14000,
          currency: 'INR',
          image: 'https://example.com/shangri.jpg',
          amenities: ['Rooftop Pool', 'Chi Spa', '24/7 Gym'],
          activities: ['City Tours', 'Shopping Assistance'],
          source: 'online',
          managerContact: {
            name: 'Vikram Singh',
            title: 'Revenue Manager',
            phone: '+91 98765 43214',
            email: 'vikram.singh@shangri-la.com',
            directContact: false
          }
        },
        {
          id: 'h6',
          name: 'Conrad Bangalore',
          location: 'Central Bangalore',
          rating: 4.7,
          price: 13500,
          currency: 'INR',
          image: 'https://example.com/conrad.jpg',
          amenities: ['Executive Lounge', 'Spa', 'Outdoor Pool'],
          activities: ['Golf Nearby', 'Wine Tasting'],
          source: 'online',
          managerContact: {
            name: 'Meera Nair',
            title: 'Director of Sales',
            phone: '+91 98765 43215',
            email: 'meera.nair@conrad.com',
            directContact: false
          }
        }
      ];

      // Filter based on search parameters
      let filteredHotels = mockHotels.filter(hotel => {
        // Location filter
        if (searchParams.location && !hotel.location.toLowerCase().includes(searchParams.location.toLowerCase())) {
          return false;
        }
        
        // Budget filter (with 20% tolerance)
        if (searchParams.budget && hotel.price > searchParams.budget * 1.2) {
          return false;
        }
        
        // Activities filter
        if (searchParams.activities && searchParams.activities.length > 0) {
          const hasActivity = searchParams.activities.some(activity => 
            hotel.activities.some(hotelActivity => 
              hotelActivity.toLowerCase().includes(activity.toLowerCase())
            )
          );
          if (!hasActivity) {
            return false;
          }
        }
        
        return true;
      });

      // Sort by rating and price
      filteredHotels.sort((a, b) => {
        // Prioritize rating, then price
        if (a.rating !== b.rating) {
          return b.rating - a.rating; // Higher rating first
        }
        return a.price - b.price; // Lower price first
      });

      return filteredHotels;
    } catch (error) {
      console.error('Error fetching online hotels:', error);
      return [];
    }
  }

  static combineAndRankHotels(localHotels, onlineHotels, searchParams) {
    // Combine both sources
    const allHotels = [...localHotels, ...onlineHotels];
    
    // Rank hotels based on multiple factors
    return allHotels.map(hotel => ({
      ...hotel,
      score: this.calculateHotelScore(hotel, searchParams)
    })).sort((a, b) => b.score - a.score);
  }

  static calculateHotelScore(hotel, searchParams) {
    let score = 0;
    
    // Base score from rating
    score += (hotel.rating || 4.0) * 20;
    
    // Bonus for local business cards (direct contact)
    if (hotel.source === 'local_card') {
      score += 30; // Significant bonus for direct contacts
    }
    
    // Budget compatibility (closer to budget = higher score)
    if (searchParams.budget && hotel.price) {
      const budgetDiff = Math.abs(hotel.price - searchParams.budget);
      const maxDiff = searchParams.budget * 0.5;
      score += (1 - Math.min(budgetDiff / maxDiff, 1)) * 20;
    }
    
    // Activity match bonus
    if (searchParams.activities && hotel.activities) {
      const matchCount = searchParams.activities.filter(activity =>
        hotel.activities.some(hotelActivity =>
          hotelActivity.toLowerCase().includes(activity.toLowerCase())
        )
      ).length;
      score += matchCount * 10;
    }
    
    return score;
  }

  static async saveHotelContact(hotel) {
    try {
      const stored = await AsyncStorage.getItem('hotel_contacts') || '[]';
      let contactList;
      
      try {
        contactList = JSON.parse(stored);
      } catch (parseError) {
        console.error('Error parsing stored contacts, resetting:', parseError);
        contactList = [];
      }
      
      if (!Array.isArray(contactList)) {
        contactList = [];
      }
      
      const newContact = {
        id: Date.now().toString(),
        hotelId: hotel.id,
        hotelName: hotel.name,
        managerContact: hotel.managerContact,
        savedAt: new Date().toISOString()
      };
      
      contactList.push(newContact);
      await AsyncStorage.setItem('hotel_contacts', JSON.stringify(contactList));
      
      return newContact;
    } catch (error) {
      console.error('Error saving hotel contact:', error);
      throw error;
    }
  }

  static async getSavedContacts() {
    try {
      const stored = await AsyncStorage.getItem('hotel_contacts') || '[]';
      let contacts;
      
      try {
        contacts = JSON.parse(stored);
      } catch (parseError) {
        console.error('Error parsing saved contacts:', parseError);
        return [];
      }
      
      return Array.isArray(contacts) ? contacts : [];
    } catch (error) {
      console.error('Error getting saved contacts:', error);
      return [];
    }
  }
}
