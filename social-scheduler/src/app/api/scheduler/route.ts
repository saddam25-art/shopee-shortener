import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, lte, and } from "drizzle-orm";

// This endpoint would be called by a cron job every minute
// For demo purposes, it can also be triggered manually
export async function POST(request: Request) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development, allow without secret
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    // Find all posts that are due and still queued
    const duePosts = await db.query.posts.findMany({
      where: and(
        eq(schema.posts.status, "queued"),
        lte(schema.posts.scheduledAt, now)
      ),
    });

    console.log(`[Scheduler] Found ${duePosts.length} posts due for publishing`);

    const results = [];

    for (const post of duePosts) {
      console.log(`[Scheduler] Processing post ${post.id}: "${post.content.substring(0, 50)}..."`);

      // Update status to 'posting'
      await db
        .update(schema.posts)
        .set({ status: "posting", updatedAt: now })
        .where(eq(schema.posts.id, post.id));

      // Get associated accounts for this post
      const postAccounts = await db.query.postAccounts.findMany({
        where: eq(schema.postAccounts.postId, post.id),
      });

      let allSucceeded = true;
      const accountResults = [];

      for (const pa of postAccounts) {
        const account = await db.query.connectedAccounts.findFirst({
          where: eq(schema.connectedAccounts.id, pa.connectedAccountId),
        });

        if (!account) {
          console.log(`[Scheduler] Account ${pa.connectedAccountId} not found`);
          continue;
        }

        console.log(`[Scheduler] Would post to ${account.platform} (${account.accountName})`);

        // MOCK: Simulate posting to the platform
        // In production, this would call the actual platform API
        const mockSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (mockSuccess) {
          await db
            .update(schema.postAccounts)
            .set({
              status: "posted",
              platformPostId: `mock_${account.platform}_${Date.now()}`,
              postedAt: now,
            })
            .where(eq(schema.postAccounts.id, pa.id));

          accountResults.push({
            platform: account.platform,
            status: "posted",
          });
        } else {
          allSucceeded = false;
          await db
            .update(schema.postAccounts)
            .set({
              status: "failed",
              errorMessage: "Mock failure for demo purposes",
            })
            .where(eq(schema.postAccounts.id, pa.id));

          accountResults.push({
            platform: account.platform,
            status: "failed",
            error: "Mock failure",
          });
        }
      }

      // Update main post status
      const finalStatus = allSucceeded ? "posted" : "failed";
      await db
        .update(schema.posts)
        .set({
          status: finalStatus,
          updatedAt: now,
          errorMessage: allSucceeded ? null : "One or more platforms failed",
        })
        .where(eq(schema.posts.id, post.id));

      results.push({
        postId: post.id,
        status: finalStatus,
        accounts: accountResults,
      });

      console.log(`[Scheduler] Post ${post.id} ${finalStatus}`);
    }

    return NextResponse.json({
      success: true,
      processed: duePosts.length,
      results,
    });
  } catch (error) {
    console.error("[Scheduler] Error:", error);
    return NextResponse.json(
      { error: "Scheduler error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check scheduler status
export async function GET() {
  try {
    const now = new Date();

    const queuedCount = (
      await db.query.posts.findMany({
        where: eq(schema.posts.status, "queued"),
      })
    ).length;

    const dueCount = (
      await db.query.posts.findMany({
        where: and(
          eq(schema.posts.status, "queued"),
          lte(schema.posts.scheduledAt, now)
        ),
      })
    ).length;

    return NextResponse.json({
      status: "ok",
      timestamp: now.toISOString(),
      queued: queuedCount,
      due: dueCount,
    });
  } catch (error) {
    console.error("[Scheduler] Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check scheduler status" },
      { status: 500 }
    );
  }
}
