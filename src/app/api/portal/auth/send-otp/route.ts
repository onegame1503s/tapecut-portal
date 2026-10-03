import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPortalOTP } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export const MASTER_ADMINS = [
  "pranaydauthal@gmail.com", 
  "manasnegi261@gmail.com",  
];

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const isMasterAdmin = MASTER_ADMINS.includes(cleanEmail);

    // 1. STRICT LOCKDOWN: Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!existingProfile) {
      if (isMasterAdmin) {
        // Auto-provision master admins instantly
        await supabaseAdmin.from("profiles").insert({
          email: cleanEmail,
          role: "admin",
          status: "approved",
        });
      } else {
        // REJECT RANDOM EMAILS. Do not create pending requests.
        return NextResponse.json({ 
          error: "Access Denied: Email not whitelisted. Contact Tapecut Admin." 
        }, { status: 403 });
      }
    } else if (isMasterAdmin && (existingProfile.role !== "admin" || existingProfile.status !== "approved")) {
      // Ensure master admins are always fully approved admins
      await supabaseAdmin.from("profiles").update({ role: "admin", status: "approved" }).eq("email", cleanEmail);
    } else if (existingProfile && existingProfile.status === "suspended") {
      return NextResponse.json({ error: "Access Denied: Account suspended." }, { status: 403 });
    }

    // 2. Insert OTP code record
    await supabaseAdmin.from("auth_otps").insert({ email: cleanEmail, otp_code: otp, expires_at: expiresAt });

    // 3. Print in terminal (fallback) and dispatch via Brevo
    console.log(`\n🔑 DEV OTP FOR [ ${cleanEmail} ]: ${otp}\n`);
    try { await sendPortalOTP(cleanEmail, otp); } catch (e) { console.warn("Brevo failed, use terminal OTP"); }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}