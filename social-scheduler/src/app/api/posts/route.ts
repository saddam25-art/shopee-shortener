import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await db.query.posts.findMany({
      where: eq(schema.posts.userId, session.user.id),
      orderBy: [desc(schema.posts.scheduledAt)],
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, scheduledAt, platforms, mediaUrls } = await request.json();

    if (!content || !scheduledAt || !platforms?.length) {
      return NextResponse.json(
        { error: "Content, scheduledAt, and platforms are required" },
        { status: 400 }
      );
    }

    const postId = generateId();

    await db.insert(schema.posts).values({
      id: postId,
      userId: session.user.id,
      content,
      scheduledAt: new Date(scheduledAt),
      mediaUrls: mediaUrls?.length ? JSON.stringify(mediaUrls) : null,
      status: "queued",
    });

    // For now, we'll store platform info in a simple way
    // In production, this would link to actual connected accounts
    for (const platform of platforms) {
      const mockAccountId = generateId();
      
      // First, ensure we have a mock connected account for this platform
      const existingAccount = await db.query.connectedAccounts.findFirst({
        where: eq(schema.connectedAccounts.userId, session.user.id),
      });

      let accountId = existingAccount?.id;

      if (!accountId) {
        // Create a mock account
        accountId = mockAccountId;
        await db.insert(schema.connectedAccounts).values({
          id: accountId,
          userId: session.user.id,
          platform,
          platformAccountId: `mock_${platform}_${Date.now()}`,
          accountName: `Demo ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
          accountHandle: `@demo_${platform}`,
          isActive: true,
        });
      }

      await db.insert(schema.postAccounts).values({
        id: generateId(),
        postId,
        connectedAccountId: accountId,
        status: "queued",
      });
    }

    return NextResponse.json({ success: true, postId });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
