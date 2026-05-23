"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";
import { defaultMapCenter, defaultMapZoom, mapboxToken } from "@/lib/mapbox";
import type { Memory } from "@/types";

type MemoryMapProps = {
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
};

export function MemoryMap({ memories, onMemorySelect }: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      center: defaultMapCenter,
      container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
      zoom: defaultMapZoom,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

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
        "flex h-9 w-9 items-center justify-center rounded-full border border-white/80 font-serif text-sm shadow-lift transition hover:scale-105";
      element.style.backgroundColor = memory.privacy === "public" ? "#f3eee6" : "#222733";
      element.style.color = memory.privacy === "public" ? "#171b24" : "#f3eee6";
      element.textContent = "A";
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

  if (!mapboxToken) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-6 text-center text-ivory">
        <div className="max-w-sm">
          <MapPin className="mx-auto h-9 w-9 text-ivory/70" />
          <h2 className="mt-4 font-serif text-lg font-semibold text-ivory">
            Mapbox token needed
          </h2>
          <p className="mt-2 text-sm leading-6 text-ivory/55">
            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your local .env file to render
            the memory map.
          </p>
        </div>
      </div>
    );
  }

  return <div className="min-h-[520px] w-full rounded-lg" ref={containerRef} />;
}
