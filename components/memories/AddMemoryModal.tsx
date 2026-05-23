"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, Eye, Lock, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { LocationPickerMap } from "@/components/map/LocationPickerMap";
import { createMemory } from "@/lib/memories";
import { cn } from "@/lib/cn";
import { defaultMapCenter } from "@/lib/mapbox";
import type { MemoryPrivacy } from "@/types";

type AddMemoryModalProps = {
  onCreated?: (memoryId: string) => void;
  onClose: () => void;
  open: boolean;
};

export function AddMemoryModal({ onClose, onCreated, open }: AddMemoryModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState(defaultMapCenter[1]);
  const [longitude, setLongitude] = useState(defaultMapCenter[0]);
  const [privacy, setPrivacy] = useState<MemoryPrivacy>("private");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(() => {
    if (!open || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 5000 },
    );
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
    setPrivacy("private");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!title.trim()) {
      setError("Add a title before saving.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const memoryId = await createMemory({
        description,
        imageFile,
        latitude,
        longitude,
        privacy,
        title,
        userId: user.uid,
      });

      reset();
      onCreated?.(memoryId);
      onClose();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not save this memory.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      description="Add the story, photo, and exact place you want to remember."
      onClose={onClose}
      open={open}
      title="Add memory"
      wide
    >
      <form className="grid gap-5 lg:grid-cols-[1fr_1.1fr]" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Title"
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The morning by the river"
            required
            value={title}
          />

          <Textarea
            label="Description"
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What happened here?"
            value={description}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Photo</span>
            <div className="rounded-lg border border-dashed border-ink/15 bg-white p-3">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="mb-3 aspect-[16/10] w-full rounded-lg object-cover"
                  src={previewUrl}
                />
              ) : (
                <div className="mb-3 flex aspect-[16/10] items-center justify-center rounded-lg bg-paper text-sm text-ink/45">
                  <Camera className="mr-2 h-4 w-4" />
                  Choose a photo
                </div>
              )}
              <input
                accept="image/*"
                className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </div>
          </label>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink">Privacy</span>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-1">
              {[
                { value: "private" as const, label: "Private", icon: Lock },
                { value: "public" as const, label: "Public", icon: Eye },
              ].map((option) => {
                const Icon = option.icon;
                const active = privacy === option.value;

                return (
                  <button
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold capitalize text-ink/60 transition",
                      active && "bg-ink text-white shadow-sm",
                    )}
                    key={option.value}
                    onClick={() => setPrivacy(option.value)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-clay" />
              Location
            </div>
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={(location) => {
                setLatitude(location.latitude);
                setLongitude(location.longitude);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              name="latitude"
              onChange={(event) => setLatitude(Number(event.target.value))}
              step="any"
              type="number"
              value={latitude}
            />
            <Input
              label="Longitude"
              name="longitude"
              onChange={(event) => setLongitude(Number(event.target.value))}
              step="any"
              type="number"
              value={longitude}
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={submitting}
              icon={<Plus className="h-4 w-4" />}
              type="submit"
            >
              {submitting ? "Saving..." : "Save memory"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
