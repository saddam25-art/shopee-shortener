"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ImagePlus, Facebook, Instagram, Twitter } from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-black" },
  { id: "tiktok", name: "TikTok", icon: () => <span className="text-lg font-bold">T</span>, color: "bg-black" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Please enter post content");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt <= new Date()) {
      setError("Scheduled time must be in the future");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          scheduledAt: scheduledAt.toISOString(),
          platforms: selectedPlatforms,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create post");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create New Post</h2>
        <p className="text-muted-foreground">
          Schedule a post across your connected social media accounts
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
            <CardDescription>
              Write your post content below. It will be published to selected platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media">Media URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="media"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <Button type="button" variant="outline" size="icon">
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a URL to an image or video to include with your post
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white",
                          platform.color
                        )}
                      >
                        <platform.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Platform connections are mocked for demo purposes
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Schedule Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
