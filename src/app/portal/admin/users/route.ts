import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET: List all operators/sales reps
export async function GET() {
  const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
  const session = await decrypt(sessionCookie);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, users: data });
}

// PATCH: Approve, suspend, or change role of a user
export async function PATCH(req: Request) {
  const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
  const session = await decrypt(sessionCookie);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, status, role } = await req.json();

  const updates: any = {};
  if (status) updates.status = status;
  if (role) updates.role = role;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, user: data });
}