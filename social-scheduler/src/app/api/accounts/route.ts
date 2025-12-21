import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.query.connectedAccounts.findMany({
      where: eq(schema.connectedAccounts.userId, session.user.id),
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
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

    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Check if already connected
    const existing = await db.query.connectedAccounts.findFirst({
      where: eq(schema.connectedAccounts.userId, session.user.id),
    });

    // For demo purposes, we create a mock connected account
    // In production, this would involve OAuth flow
    const accountId = generateId();
    const platformNames: Record<string, string> = {
      facebook: "Facebook Page",
      instagram: "Instagram Business",
      twitter: "Twitter/X",
      tiktok: "TikTok",
    };

    await db.insert(schema.connectedAccounts).values({
      id: accountId,
      userId: session.user.id,
      platform,
      platformAccountId: `mock_${platform}_${Date.now()}`,
      accountName: `My ${platformNames[platform] || platform}`,
      accountHandle: `@demo_${platform}_user`,
      isActive: true,
    });

    return NextResponse.json({ success: true, accountId });
  } catch (error) {
    console.error("Error connecting account:", error);
    return NextResponse.json(
      { error: "Failed to connect account" },
      { status: 500 }
    );
  }
}
