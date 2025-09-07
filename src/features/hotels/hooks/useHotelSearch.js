import { useCallback, useState } from "react";
import { SimpleHotelService } from "../services/SimpleHotelService";

export const useHotelSearch = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchHotels = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Starting hotel search...");
      const results = await SimpleHotelService.searchHotels(searchParams);
      console.log("Search results:", results);
      setHotels(results);

      return results;
    } catch (err) {
      console.error("Hotel search error:", err);
      setError(err.message || "Search failed");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContact = useCallback(async (hotel) => {
    try {
      console.log("Saving contact for hotel:", hotel.name);
      const savedContact = await SimpleHotelService.saveHotelContact(hotel);
      return savedContact;
    } catch (err) {
      setError(err.message);
      console.error("Save contact error:", err);
      return null;
    }
  }, []);

  const getSavedContacts = useCallback(async () => {
    try {
      const contacts = await SimpleHotelService.getSavedContacts();
      return contacts;
    } catch (err) {
      setError(err.message);
      console.error("Get saved contacts error:", err);
      return [];
    }
  }, []);

  return {
    hotels,
    loading,
    error,
    searchHotels,
    saveContact,
    getSavedContacts,
  };
};
