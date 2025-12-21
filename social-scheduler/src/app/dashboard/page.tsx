import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Calendar, Clock, CheckCircle, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

async function getStats(userId: string) {
  const posts = await db.query.posts.findMany({
    where: eq(schema.posts.userId, userId),
  });

  const accounts = await db.query.connectedAccounts.findMany({
    where: eq(schema.connectedAccounts.userId, userId),
  });

  return {
    total: posts.length,
    queued: posts.filter((p) => p.status === "queued").length,
    posted: posts.filter((p) => p.status === "posted").length,
    failed: posts.filter((p) => p.status === "failed").length,
    accounts: accounts.length,
  };
}

async function getRecentPosts(userId: string) {
  return db.query.posts.findMany({
    where: eq(schema.posts.userId, userId),
    orderBy: [desc(schema.posts.scheduledAt)],
    limit: 10,
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const stats = await getStats(userId);
  const recentPosts = await getRecentPosts(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your scheduled posts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-post">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time scheduled posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queued}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to be posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posted}</div>
            <p className="text-xs text-muted-foreground">
              Successfully published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                Create your first scheduled post to get started.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/new-post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled for {formatDate(post.scheduledAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
