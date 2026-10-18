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

    let query = supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false });

    if (session.role !== "admin") {
      query = query.eq("sales_rep_id", session.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, leads: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leadData = await req.json();

    if (!leadData.business_name || !leadData.sales_rep_id) {
      return NextResponse.json({ error: "Business name and assigned rep required." }, { status: 400 });
    }

    // Default status is 'assigned' if not provided
    const { data, error } = await supabaseAdmin.from("leads").insert({
      ...leadData,
      status: 'assigned'
    }).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, lead: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lead_id, status } = await req.json();
    if (!lead_id || !status) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ status })
      .eq("id", lead_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing lead ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Lead Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}