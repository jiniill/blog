import { NextResponse } from "next/server";
import {
  deleteAdminPostBySlug,
  getAdminPostBySlug,
  parseAdminPostPayload,
  resolveAdminErrorMessage,
  resolveAdminErrorStatus,
  updateAdminPostBySlug,
} from "@/lib/admin/post-files";

export const runtime = "nodejs";

function createNotFoundResponse() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isDevelopmentEnvironment()) {
    return createNotFoundResponse();
  }

  try {
    const { slug } = await params;
    const post = await getAdminPostBySlug(slug);
    return NextResponse.json({ post });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isDevelopmentEnvironment()) {
    return createNotFoundResponse();
  }

  try {
    const { slug } = await params;
    const payload = parseAdminPostPayload(await request.json(), slug);
    const post = await updateAdminPostBySlug(slug, payload);
    return NextResponse.json({ post });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isDevelopmentEnvironment()) {
    return createNotFoundResponse();
  }

  try {
    const { slug } = await params;
    await deleteAdminPostBySlug(slug);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}
