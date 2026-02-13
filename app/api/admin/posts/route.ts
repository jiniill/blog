import { NextResponse } from "next/server";
import {
  createAdminPost,
  listAdminPosts,
  parseAdminPostPayload,
  resolveAdminErrorMessage,
  resolveAdminErrorStatus,
} from "@/lib/admin/post-files";

export const runtime = "nodejs";

function createNotFoundResponse() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

export async function GET() {
  if (!isDevelopmentEnvironment()) {
    return createNotFoundResponse();
  }

  try {
    const items = await listAdminPosts();
    return NextResponse.json({ items });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  if (!isDevelopmentEnvironment()) {
    return createNotFoundResponse();
  }

  try {
    const payload = parseAdminPostPayload(await request.json());
    const post = await createAdminPost(payload);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}
