import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and token required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify OTP existence and expiration
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("auth_otps")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp_code", otp.trim())
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
    }

    // 2. Fetch User Profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile state invalid." }, { status: 500 });
    }

    if (profile.status === "suspended") {
      return NextResponse.json({ error: "Account suspended." }, { status: 403 });
    }

    // 3. Create HTTP-Only JWT Session Cookie
    await createSession({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
    });

    // 4. Burn the used OTP so it can't be replayed
    await supabaseAdmin.from("auth_otps").delete().eq("id", otpRecord.id);

    // Determine redirect path based on status and role
    let redirectUrl = "/portal/sales";
    if (profile.status === "pending_approval") redirectUrl = "/portal/pending";
    else if (profile.role === "admin") redirectUrl = "/portal/admin";

    return NextResponse.json({ success: true, redirect: redirectUrl });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Server error during verification." }, { status: 500 });
  }
}