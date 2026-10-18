import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET: Sales reps see their own deals. Admins see the entire agency ledger.
export async function GET() {
  const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
  const session = await decrypt(sessionCookie);

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = supabaseAdmin.from("deals").select("*, profiles(email)").order("created_at", { ascending: false });

  if (session.role !== "admin") {
    query = query.eq("sales_rep_id", session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, deals: data });
}

// POST: Sales reps log a new closed deal
export async function POST(req: Request) {
  const sessionCookie = (await cookies()).get("tapecut_portal_session")?.value;
  const session = await decrypt(sessionCookie);

  if (!session || session.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized or unapproved" }, { status: 401 });
  }

  const { client_name, client_phone, contract_value, scope } = await req.json();

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
      scope,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, deal: data });
}

// DELETE: Admins can remove accidental records
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing deal ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Deal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}