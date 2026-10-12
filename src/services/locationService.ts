// src/services/locationService.ts
import { Platform } from 'react-native';
import { LocationData } from '../types/photo';

let ExpoLocation: any = null;
if (Platform.OS !== 'web') {
  try {
    ExpoLocation = require('expo-location');
  } catch {}
}

export class LocationService {
  private static cachedLocation: LocationData | null = null;
  private static lastFetchTime: number = 0;

  /**
   * Request location permissions
   */
  public static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          return true;
        }
        return false;
      }

      if (!ExpoLocation) return false;
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location with reverse geocoding
   */
  public static async getCurrentLocation(): Promise<LocationData> {
    const now = Date.now();
    // Cache for 10 seconds to avoid unnecessary rapid GPS polling
    if (this.cachedLocation && now - this.lastFetchTime < 10000) {
      return this.cachedLocation;
    }

    try {
      let lat = 15.289412;
      let lng = 108.734208;
      let accuracy = 8.5;
      let isMocked = false;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 10000,
          });
        }).catch((err) => {
          console.warn('Web geolocation warning/denied, using fallback center:', err);
          return null;
        });

        if (position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          accuracy = position.coords.accuracy || 12;
        }
      } else if (Platform.OS !== 'web' && ExpoLocation) {
        const hasPermission = await this.requestPermissions();
        if (hasPermission) {
          const loc = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.High,
          });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          accuracy = loc.coords.accuracy || 10;
          isMocked = (loc.mocked as boolean) || false;
        }
      }

      // Reverse geocode to address
      const address = await this.reverseGeocode(lat, lng);

      const locationData: LocationData = {
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        accuracy: Math.round(accuracy),
        address: address.formattedAddress,
        ward: address.ward,
        district: address.district,
        city: address.city,
        street: address.street,
        isMocked,
      };

      this.cachedLocation = locationData;
      this.lastFetchTime = now;
      return locationData;
    } catch (error) {
      console.warn('Fallback location used due to error:', error);
      const fallback: LocationData = {
        latitude: 15.289412,
        longitude: 108.734208,
        accuracy: 10,
        address: 'Tôn Hoa Sen – Chi nhánh Bình Sơn, Long Bình Hamlet, X. Bình Sơn, Quảng Ngãi',
        ward: 'Xã Bình Sơn',
        district: 'Huyện Bình Sơn',
        city: 'Quảng Ngãi',
        isMocked: false,
      };
      this.cachedLocation = fallback;
      return fallback;
    }
  }

  /**
   * Reverse geocoding to structured Vietnamese address
   */
  private static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ formattedAddress: string; street?: string; ward?: string; district?: string; city?: string }> {
    try {
      if (Platform.OS !== 'web' && ExpoLocation) {
        const reverseResults = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
        if (reverseResults && reverseResults.length > 0) {
          const item = reverseResults[0];
          const parts = [
            item.name || item.street,
            item.subregion || item.district,
            item.region || item.city,
            item.country,
          ].filter(Boolean);

          const full = parts.join(', ');
          if (full.length > 5) {
            return {
              formattedAddress: full,
              street: item.street || undefined,
              district: item.district || item.subregion || undefined,
              city: item.city || item.region || undefined,
            };
          }
        }
      }

      // Web or fallback using public OpenStreetMap Nominatim reverse geocode if network is active
      if (typeof fetch !== 'undefined') {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'TimestampProApp/1.0' } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json && json.display_name) {
            const addr = json.address || {};
            const city = addr.city || addr.state || addr.province || 'Việt Nam';
            const district = addr.county || addr.suburb || addr.district || '';
            const road = addr.road || addr.amenity || addr.building || '';
            const formatted = [road, district, city].filter(Boolean).join(', ') || json.display_name;

            return {
              formattedAddress: formatted,
              street: road,
              district,
              city,
            };
          }
        }
      }
    } catch {
      // Fallback
    }

    return {
      formattedAddress: `Tọa độ: ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E – Việt Nam`,
    };
  }

  /**
   * Calculate distance between two coordinates in meters (Haversine formula)
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }
}
