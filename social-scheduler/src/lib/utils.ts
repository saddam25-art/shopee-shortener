import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "queued":
      return "bg-yellow-100 text-yellow-800";
    case "posting":
      return "bg-blue-100 text-blue-800";
    case "posted":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case "facebook":
      return "bg-blue-600";
    case "instagram":
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    case "tiktok":
      return "bg-black";
    case "twitter":
      return "bg-sky-500";
    default:
      return "bg-gray-500";
  }
}
