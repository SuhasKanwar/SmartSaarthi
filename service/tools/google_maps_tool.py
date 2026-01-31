import os
import googlemaps
from langchain.tools import tool
from dotenv import load_dotenv
from utils.logger import logger

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

class GoogleMapsTools:
    def __init__(self):
        try:
            if GOOGLE_MAPS_API_KEY:
                self.gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
            else:
                self.gmaps = None
                logger.warning("GOOGLE_MAPS_API_KEY not found in environment variables.")
        except Exception as e:
            logger.error(f"Error initializing Google Maps Client: {str(e)}")
            self.gmaps = None

    @tool
    def search_place(query: str):
        """
        Search for a place on Google Maps to get its coordinates (latitude and longitude).
        Useful when the user asks for a location, directions, or where something is.
        Returns the name, address, and geometry (lat/lng).
        """
        try:
            # We need to access the instance 'gmaps' but @tool makes it a static function effectively if not bound carefully.
            # A better way for class-based tools in LangChain is using `StructuredTool` or binding methods.
            # However, simpler is to instantiate client inside or use a global if acceptable, or use the class method approach.
            
            # Let's use a standalone instance for the tool function to keep it simple with @tool decorator
            # or we pass the instance.
            
            if not GOOGLE_MAPS_API_KEY:
                return "Google Maps API Key not configured."
                
            gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
            
            # Text Search
            result = gmaps.places(query=query)
            
            if result['status'] == 'OK' and result['results']:
                place = result['results'][0]
                name = place.get('name')
                address = place.get('formatted_address')
                location = place['geometry']['location']
                
                return {
                    "name": name,
                    "address": address,
                    "location": location, # {lat: ..., lng: ...}
                    "status": "found"
                }
            else:
                return {"status": "not_found", "message": "Location not found."}
                
        except Exception as e:
            logger.error(f"Google Maps Search Error: {str(e)}")
            return {"status": "error", "message": str(e)}

    @tool
    def find_places_nearby(keyword: str, location: str, radius: int | str = 5000):
        """
        Search for nearby places using Google Maps Places API.
        Args:
            keyword: The term to search for (e.g., "battery charging station").
            location: The latitude/longitude around which to retrieve place information. This must be specified as 'latitude,longitude'.
            radius: Distance in meters within which to bias results. (Default: 5000)
        Returns:
            A list of nearby places with names and addresses.
        """
        try:
            if not GOOGLE_MAPS_API_KEY:
                return "Google Maps API Key not configured."
                
            gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
            
            # Parse location string to dict or tuple if needed, but client might accept string "lat,lng"
            # googlemaps python client expects location as (lat, lng) tuple or dict or string "lat,lng"
            radius = int(radius)
            result = gmaps.places_nearby(location=location, keyword=keyword, radius=radius)
            
            if result['status'] == 'OK' and result['results']:
                # Return top result for simplicity, or list
                # For the app flow, we usually just want to show one or a list.
                # Let's return the top match similar to search_place
                place = result['results'][0]
                name = place.get('name')
                address = place.get('vicinity') # Vicinity is used for nearby search results
                loc = place['geometry']['location']
                
                return {
                    "name": name,
                    "address": address,
                    "location": loc,
                    "status": "found",
                    "results_count": len(result['results'])
                }
            else:
                return {"status": "not_found", "message": "No nearby places found."}
                
        except Exception as e:
            logger.error(f"Google Maps Nearby Search Error: {str(e)}")
            return {"status": "error", "message": str(e)}

    def get_tools(self):
        return [self.search_place, self.find_places_nearby]
