"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RasterWorldMap } from "@/components/map/RasterWorldMap";
import { cn } from "@/lib/cn";
import {
  defaultMapCenter,
  defaultMapZoom,
  mapboxToken,
} from "@/lib/mapbox";
import type { MapLocationTarget, Memory } from "@/types";

type MemoryMapProps = {
  className?: string;
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  searchTarget?: MapLocationTarget | null;
};

export function MemoryMap({
  className,
  memories,
  onMemorySelect,
  searchTarget,
}: MemoryMapProps) {
  const rasterMarkers = useMemo(
    () =>
      memories.map((memory) => ({
        id: memory.id,
        latitude: memory.latitude,
        longitude: memory.longitude,
        onClick: () => onMemorySelect(memory),
        privacy: memory.privacy,
        title: memory.title,
      })),
    [memories, onMemorySelect],
  );

  if (!mapboxToken) {
    return (
      <RasterWorldMap
        className={className}
        markers={rasterMarkers}
        searchTarget={searchTarget}
      />
    );
  }

  return (
    <MapboxMemoryMap
      className={className}
      memories={memories}
      onMemorySelect={onMemorySelect}
      searchTarget={searchTarget}
    />
  );
}

function MapboxMemoryMap({
  className,
  memories,
  onMemorySelect,
  searchTarget,
}: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      center: defaultMapCenter,
      container: containerRef.current,
      renderWorldCopies: true,
      style: "mapbox://styles/mapbox/light-v11",
      zoom: defaultMapZoom,
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = memories.map((memory) => {
      const element = document.createElement("button");
      element.type = "button";
      element.setAttribute("aria-label", `Open ${memory.title}`);
      element.className =
        "flex h-7 w-7 items-center justify-center rounded-full border border-[#20262f] text-[11px] font-bold shadow-[0_6px_18px_rgba(32,38,47,0.22)] transition hover:scale-110";
      element.style.backgroundColor = memory.privacy === "public" ? "#f7c9c8" : "#7a7ecb";
      element.style.color = memory.privacy === "public" ? "#20262f" : "#ffffff";
      element.textContent = "1";
      element.addEventListener("click", () => onMemorySelect(memory));

      return new mapboxgl.Marker({ element })
        .setLngLat([memory.longitude, memory.latitude])
        .addTo(mapRef.current as mapboxgl.Map);
    });

    if (memories.length > 0 && !searchTarget) {
      const bounds = new mapboxgl.LngLatBounds();
      memories.forEach((memory) => bounds.extend([memory.longitude, memory.latitude]));
      mapRef.current.fitBounds(bounds, {
        duration: 900,
        maxZoom: 13,
        padding: 80,
      });
    }
  }, [memories, onMemorySelect, searchTarget]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = null;

    if (!searchTarget) {
      return;
    }

    const element = document.createElement("div");
    element.setAttribute("aria-label", `Searched address: ${searchTarget.label}`);
    element.className =
      "h-9 w-9 rounded-full border-4 border-white bg-[#2563eb] shadow-[0_12px_28px_rgba(37,99,235,0.35)] ring-4 ring-blue-500/25";

    searchMarkerRef.current = new mapboxgl.Marker({ anchor: "center", element })
      .setLngLat([searchTarget.longitude, searchTarget.latitude])
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [searchTarget.longitude, searchTarget.latitude],
      duration: 950,
      essential: true,
      zoom: Math.max(mapRef.current.getZoom(), 13),
    });
  }, [searchTarget]);

  return (
    <div
      className={cn("min-h-[520px] w-full rounded-lg", className)}
      ref={containerRef}
    />
  );
}
