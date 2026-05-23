"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RasterWorldMap } from "@/components/map/RasterWorldMap";
import { mapboxToken } from "@/lib/mapbox";

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  onChange: (location: { latitude: number; longitude: number }) => void;
};

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  if (!mapboxToken) {
    return (
      <RasterWorldMap
        ariaLabel="Choose memory location"
        className="min-h-64 rounded-lg"
        markers={[
          {
            id: "selected-location",
            label: "",
            latitude,
            longitude,
            privacy: "private",
            title: "Selected location",
          },
        ]}
        onMapClick={onChange}
      />
    );
  }

  return (
    <MapboxLocationPickerMap
      latitude={latitude}
      longitude={longitude}
      onChange={onChange}
    />
  );
}

function MapboxLocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      center: [longitude, latitude],
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      zoom: 12,
    });

    markerRef.current = new mapboxgl.Marker({
      color: "#b8614b",
      draggable: true,
    })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);

    mapRef.current.on("click", (event) => {
      onChangeRef.current({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    });

    markerRef.current.on("dragend", () => {
      const nextLocation = markerRef.current?.getLngLat();

      if (nextLocation) {
        onChangeRef.current({
          latitude: nextLocation.lat,
          longitude: nextLocation.lng,
        });
      }
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
    mapRef.current?.easeTo({ center: [longitude, latitude], duration: 500 });
  }, [latitude, longitude]);

  return <div className="min-h-64 rounded-lg" ref={containerRef} />;
}
