import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ success: true, users: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId, status, role } = await req.json();
    const updates: any = {};
    if (status) updates.status = status;
    if (role) updates.role = role;

    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// NEW: API to Whitelist/Add new users directly as approved
export async function POST(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { email, role } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        email: email.trim().toLowerCase(),
        role: role || "sales",
        status: "approved" // Instantly approved, no pending state!
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: "Email is already whitelisted." }, { status: 400 });
      throw error;
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}