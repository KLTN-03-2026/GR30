"use client";

import React, { useState, useEffect, useRef } from "react";
import Map, { Marker, NavigationControl, ViewStateChangeEvent, MapRef } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import debounce from "lodash.debounce";

interface MapLocationPickerProps {
  location: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
  addressSearch?: string;
  onAddressSelect?: (address: string) => void;
  className?: string;
}

export function MapLocationPicker({
  location,
  onChange,
  addressSearch,
  onAddressSelect,
  className,
}: MapLocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: location?.lng || 108.2022,
    latitude: location?.lat || 16.0544,
    zoom: 13,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update map center when address changes
  useEffect(() => {
    if (!addressSearch || addressSearch.trim().length < 5) return;

    const geocode = debounce(async (addr: string) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            addr
          )}&limit=1`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: 15,
          }));
          
          // Optionally auto-update the marker location if the user hasn't clicked yet
          // or force it to update to the new searched address
          onChange({ lat, lng });
          
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }, 1000);

    geocode(addressSearch);

    return () => geocode.cancel();
  }, [addressSearch, onChange]);

  // Update map center when location explicitly changes from parent
  useEffect(() => {
    if (location?.lat && location?.lng) {
      setViewState((prev) => ({
        ...prev,
        longitude: location.lng,
        latitude: location.lat,
      }));
      mapRef.current?.flyTo({ center: [location.lng, location.lat] });
    }
  }, [location?.lat, location?.lng]);

  if (!mounted) {
    return <div className={`bg-muted animate-pulse ${className}`} />;
  }

  return (
    <div
      className={`relative w-full rounded-md overflow-hidden border ${className}`}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        onClick={async (evt) => {
          const lat = evt.lngLat.lat;
          const lng = evt.lngLat.lng;
          onChange({ lat, lng });

          if (onAddressSelect) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
              );
              const data = await res.json();
              if (data && data.display_name) {
                onAddressSelect(data.display_name);
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
            }
          }
        }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />
        {location && (
          <Marker
            longitude={location.lng}
            latitude={location.lat}
            anchor="bottom"
          >
            <div className="text-red-500 animate-bounce cursor-pointer">
              <MapPin className="w-8 h-8 fill-red-500/20" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
