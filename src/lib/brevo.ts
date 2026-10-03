export async function sendPortalOTP(email: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing from environment variables.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      // REPLACE THIS with the exact email address you used to sign into your Brevo account
      sender: { name: "Tapecut Studios", email: "workplace4568@gmail.com" },
      to: [{ email }],
      subject: "Your Tapecut Secure Access Code",
      htmlContent: `
        <div style="font-family: monospace; background-color: #0a0a0a; color: #f8fafc; padding: 40px; text-align: center;">
          <h2 style="color: #fff; text-transform: uppercase; letter-spacing: 2px;">Tapecut Internal Ops</h2>
          <p style="color: #888;">Your secure authentication token is:</p>
          <div style="background-color: #111; border: 1px solid #333; padding: 20px; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px auto; max-width: 300px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px;">Valid for 10 minutes. Do not share.</p>
        </div>
      `
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API Rejection:", errorText);
    throw new Error(`Brevo dispatch failed: ${errorText}`);
  }

  return true;
}

export async function sendAdminDealAlert(adminEmails: string[], dealDetails: {
  client_name: string;
  client_phone: string;
  contract_value: number;
  scope: string;
  buffer_time: string;
  description: string;
  sales_rep_email: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || adminEmails.length === 0) return;

  const recipients = adminEmails.map(email => ({ email }));

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "Tapecut Pipeline Bot", email: "workplace4568@gmail.com" },
      to: recipients,
      subject: `[NEW DEAL COMMITTED] ₹${dealDetails.contract_value.toLocaleString()} - ${dealDetails.client_name}`,
      htmlContent: `
        <div style="font-family: monospace; background-color: #0a0a0a; color: #f8fafc; padding: 30px; border: 1px solid #333;">
          <h2 style="color: #10b981; text-transform: uppercase; margin-top: 0;">New Contract Committed</h2>
          <p style="color: #888; font-size: 13px;">A new deal has been logged into the Tapecut Ops pipeline.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Client Name:</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #222;">${dealDetails.client_name}</td></tr>
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Client Phone:</td><td style="padding: 8px; border-bottom: 1px solid #222;">${dealDetails.client_phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Contract Value:</td><td style="padding: 8px; font-weight: bold; color: #10b981; border-bottom: 1px solid #222;">₹${dealDetails.contract_value.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Project Scope:</td><td style="padding: 8px; border-bottom: 1px solid #222;">${dealDetails.scope}</td></tr>
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Buffer Time:</td><td style="padding: 8px; color: #f59e0b; border-bottom: 1px solid #222;">${dealDetails.buffer_time}</td></tr>
            <tr><td style="padding: 8px; color: #888; border-bottom: 1px solid #222;">Sales Operator:</td><td style="padding: 8px; border-bottom: 1px solid #222;">${dealDetails.sales_rep_email}</td></tr>
          </table>

          <div style="margin-top: 20px; background: #111; padding: 15px; border: 1px solid #222;">
            <p style="color: #888; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0;">Project Notes / Description:</p>
            <p style="margin: 0; font-size: 13px; color: #ddd; white-space: pre-wrap;">${dealDetails.description || "No additional description provided."}</p>
          </div>
        </div>
      `
    }),
  });
}