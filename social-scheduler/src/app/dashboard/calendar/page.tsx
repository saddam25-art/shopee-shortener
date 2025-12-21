"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getStatusColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  scheduledAt: string;
  status: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    }
    fetchPosts();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getPostsForDay = (date: Date) => {
    return posts.filter((post) =>
      isSameDay(new Date(post.scheduledAt), date)
    );
  };

  const selectedDayPosts = selectedDate ? getPostsForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-muted-foreground">
            View your scheduled posts in calendar format
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-post">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                <div
                  key={dayName}
                  className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}
              {days.map((dayDate, idx) => {
                const dayPosts = getPostsForDay(dayDate);
                const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(dayDate)}
                    className={cn(
                      "bg-background p-2 min-h-[80px] text-left transition-colors hover:bg-accent",
                      !isSameMonth(dayDate, currentMonth) && "text-muted-foreground opacity-50",
                      isSelected && "ring-2 ring-primary ring-inset",
                      isToday(dayDate) && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        isToday(dayDate) && "bg-primary text-primary-foreground"
                      )}
                    >
                      {format(dayDate, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayPosts.slice(0, 2).map((post) => (
                        <div
                          key={post.id}
                          className="text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {format(new Date(post.scheduledAt), "HH:mm")}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click on a date to see scheduled posts
              </p>
            ) : selectedDayPosts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  No posts scheduled for this day
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/new-post">Schedule a post</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {format(new Date(post.scheduledAt), "HH:mm")}
                      </span>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
