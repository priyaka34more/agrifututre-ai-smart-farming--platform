/**
 * Location Service - Handles geolocation and location-based features
 */

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationPermission = 'prompt'; // 'prompt', 'granted', 'denied'
    this.watchId = null;
    this.callbacks = [];
  }

  // Get current position
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.locationPermission = 'granted';
          resolve(this.currentLocation);
        },
        (error) => {
          this.locationPermission = 'denied';
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Watch position for continuous updates
  watchPosition(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.locationPermission = 'granted';
        callback(this.currentLocation);
      },
      (error) => {
        this.locationPermission = 'denied';
        callback(null, this.handleGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  // Stop watching position
  stopWatching() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Handle geolocation errors
  handleGeolocationError(error) {
    const errors = {
      1: 'Location permission denied by user',
      2: 'Location position unavailable',
      3: 'Location request timed out',
      4: 'Location unknown error'
    };

    const message = errors[error.code] || 'Unknown location error';
    return new Error(message);
  }

  // Get permission status
  getPermissionStatus() {
    return this.locationPermission;
  }

  // Get current location
  getLocation() {
    return this.currentLocation;
  }

  // Check if location is available
  hasLocation() {
    return this.currentLocation !== null;
  }

  // Format location for API calls
  formatForAPI() {
    if (!this.currentLocation) return null;
    return {
      lat: this.currentLocation.latitude,
      lon: this.currentLocation.longitude
    };
  }

  // Calculate distance between two points (in km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get location name from coordinates (reverse geocoding)
  async getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting location name:', error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }
}

// Create a named instance for export
const locationServiceInstance = new LocationService();

export default locationServiceInstance;
