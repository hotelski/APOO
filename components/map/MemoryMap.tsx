"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RasterWorldMap } from "@/components/map/RasterWorldMap";
import { cn } from "@/lib/cn";
import {
  defaultMapCenter,
  defaultMapZoom,
  mapboxToken,
} from "@/lib/mapbox";
import type { Memory } from "@/types";

type MemoryMapProps = {
  className?: string;
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
};

export function MemoryMap({ className, memories, onMemorySelect }: MemoryMapProps) {
  if (!mapboxToken) {
    return (
      <RasterWorldMap
        className={className}
        markers={memories.map((memory) => ({
          id: memory.id,
          latitude: memory.latitude,
          longitude: memory.longitude,
          onClick: () => onMemorySelect(memory),
          privacy: memory.privacy,
          title: memory.title,
        }))}
      />
    );
  }

  return (
    <MapboxMemoryMap
      className={className}
      memories={memories}
      onMemorySelect={onMemorySelect}
    />
  );
}

function MapboxMemoryMap({ className, memories, onMemorySelect }: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

    if (memories.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      memories.forEach((memory) => bounds.extend([memory.longitude, memory.latitude]));
      mapRef.current.fitBounds(bounds, {
        duration: 900,
        maxZoom: 13,
        padding: 80,
      });
    }
  }, [memories, onMemorySelect]);

  return (
    <div
      className={cn("min-h-[520px] w-full rounded-lg", className)}
      ref={containerRef}
    />
  );
}
