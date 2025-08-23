import { useState } from "preact/hooks";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  location: LocationData | null;
  onChange: (location: LocationData | null) => void;
  required?: boolean;
  className?: string;
}

export default function LocationPicker({
  location,
  onChange,
  required = false,
  className = "",
}: LocationPickerProps) {
  const [manualEntry, setManualEntry] = useState(false);
  const [latitude, setLatitude] = useState(location?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(location?.longitude?.toString() || "");
  const [address, setAddress] = useState(location?.address || "");

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: address || "Current location",
        };
        setLatitude(newLocation.latitude.toString());
        setLongitude(newLocation.longitude.toString());
        onChange(newLocation);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please enter coordinates manually.");
        setManualEntry(true);
      },
    );
  };

  const handleManualLocationUpdate = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid latitude and longitude values.");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90.");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("Longitude must be between -180 and 180.");
      return;
    }

    const newLocation = {
      latitude: lat,
      longitude: lng,
      address: address || `${lat}, ${lng}`,
    };
    onChange(newLocation);
  };

  const clearLocation = () => {
    setLatitude("");
    setLongitude("");
    setAddress("");
    onChange(null);
  };

  return (
    <div class={`space-y-4 ${className}`}>
      <div class="form-control">
        <label class="label">
          <span class="label-text">
            Location {required && <span class="text-error">*</span>}
          </span>
        </label>

        {location
          ? (
            <div class="bg-base-200 p-3 rounded">
              <div class="text-sm font-medium mb-2">Current Location:</div>
              <div class="text-xs">
                <div>Latitude: {location.latitude}</div>
                <div>Longitude: {location.longitude}</div>
                {location.address && <div>Address: {location.address}</div>}
              </div>
              <div class="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setManualEntry(!manualEntry)}
                  class="btn btn-xs btn-outline"
                >
                  {manualEntry ? "Hide Edit" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={clearLocation}
                  class="btn btn-xs btn-error"
                >
                  Clear
                </button>
              </div>
            </div>
          )
          : (
            <div class="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                class="btn btn-outline"
              >
                📍 Get Current Location
              </button>
              <button
                type="button"
                onClick={() => setManualEntry(!manualEntry)}
                class="btn btn-outline"
              >
                📝 Enter Manually
              </button>
            </div>
          )}
      </div>

      {(manualEntry || !location) && (
        <div class="border p-4 rounded bg-base-100">
          <div class="text-sm font-medium mb-3">Enter Location Details</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">Latitude</span>
              </label>
              <input
                type="number"
                step="any"
                class="input input-bordered input-sm"
                placeholder="e.g., 40.7128"
                value={latitude}
                onInput={(e) => setLatitude(e.currentTarget.value)}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">Longitude</span>
              </label>
              <input
                type="number"
                step="any"
                class="input input-bordered input-sm"
                placeholder="e.g., -74.0060"
                value={longitude}
                onInput={(e) => setLongitude(e.currentTarget.value)}
              />
            </div>
          </div>

          <div class="form-control mt-3">
            <label class="label">
              <span class="label-text text-xs">Address (optional)</span>
            </label>
            <input
              type="text"
              class="input input-bordered input-sm"
              placeholder="e.g., New York, NY, USA"
              value={address}
              onInput={(e) => setAddress(e.currentTarget.value)}
            />
          </div>

          <div class="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleManualLocationUpdate}
              class="btn btn-sm btn-primary"
              disabled={!latitude || !longitude}
            >
              Save Location
            </button>
            <button
              type="button"
              onClick={() => setManualEntry(false)}
              class="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {location && (
        <div class="text-xs text-gray-500">
          <div class="mb-1">💡 Tips:</div>
          <ul class="list-disc list-inside space-y-1">
            <li>You can get coordinates from Google Maps by right-clicking on a location</li>
            <li>Make sure the location is accurate as it will be used for search and filtering</li>
          </ul>
        </div>
      )}
    </div>
  );
}
