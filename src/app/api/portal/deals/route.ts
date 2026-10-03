import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { sendAdminDealAlert } from "@/lib/brevo";
import { MASTER_ADMINS } from "../auth/send-otp/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let query = supabaseAdmin.from("deals").select("*, profiles(email)").order("created_at", { ascending: false });

    if (session.role !== "admin") {
      query = query.eq("sales_rep_id", session.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, deals: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.status !== "approved") {
      return NextResponse.json({ error: "Unauthorized or unapproved" }, { status: 401 });
    }

    const { client_name, client_phone, contract_value, scope, buffer_time, description } = await req.json();

    if (!client_name || !contract_value) {
      return NextResponse.json({ error: "Client name and contract value required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert({
        sales_rep_id: session.id,
        client_name,
        client_phone,
        contract_value: Number(contract_value),
        scope: scope || "Full-Stack Web App",
        buffer_time: buffer_time || "Standard",
        description: description || "",
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch all active admin emails from database + hardcoded master admins
    const { data: adminProfiles } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("role", "admin")
      .eq("status", "approved");

    const dbAdminEmails = adminProfiles?.map(a => a.email) || [];
    const allAdminEmails = Array.from(new Set([...MASTER_ADMINS, ...dbAdminEmails]));

    // Fire Brevo alert to all admins asynchronously
    await sendAdminDealAlert(allAdminEmails, {
      client_name,
      client_phone,
      contract_value: Number(contract_value),
      scope: scope || "Full-Stack Web App",
      buffer_time: buffer_time || "Standard",
      description: description || "",
      sales_rep_email: session.email,
    });

    return NextResponse.json({ success: true, deal: data });
  } catch (error: any) {
    console.error("Deal Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}