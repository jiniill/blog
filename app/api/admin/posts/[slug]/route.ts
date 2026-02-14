import { NextResponse } from "next/server";
import {
  deleteAdminPostBySlug,
  getAdminPostBySlug,
  parseAdminPostPayload,
  resolveAdminErrorMessage,
  resolveAdminErrorStatus,
  updateAdminPostBySlug,
} from "@/lib/admin/post-files";
import { decodeRouteParam } from "@/lib/route-params";

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
    const normalizedSlug = decodeRouteParam(slug);
    const post = await getAdminPostBySlug(normalizedSlug);
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
    const normalizedSlug = decodeRouteParam(slug);
    const payload = parseAdminPostPayload(await request.json(), normalizedSlug);
    const post = await updateAdminPostBySlug(normalizedSlug, payload);
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
    const normalizedSlug = decodeRouteParam(slug);
    await deleteAdminPostBySlug(normalizedSlug);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: resolveAdminErrorMessage(error) },
      { status: resolveAdminErrorStatus(error) },
    );
  }
}
