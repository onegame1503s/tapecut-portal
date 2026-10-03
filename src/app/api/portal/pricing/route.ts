import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("pricing_plans")
      .select("*")
      .order("shop_size", { ascending: false })
      .order("tier_level", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, pricing: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates = await req.json();
    const { id, name, upfront_price, monthly_price, features } = updates;

    const { data, error } = await supabaseAdmin
      .from("pricing_plans")
      .update({ name, upfront_price, monthly_price, features, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, plan: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}