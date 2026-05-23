"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
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

  if (!mapboxToken) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-5 text-center text-sm text-ivory/55">
        Add a Mapbox token to use the visual picker, or enter coordinates below.
      </div>
    );
  }

  return <div className="min-h-64 rounded-lg" ref={containerRef} />;
}
