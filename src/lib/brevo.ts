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
      // Inside sendPortalOTP:
sender: { name: "Tapecut Studios Identity Access", email: "auth@tapecut.info" },
      to: [{ email }],
      subject: `[SECURE] Verification Token — ${otp}`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tapecut Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 40px 16px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
                  
                  <!-- Top Accent Bar -->
                  <tr>
                    <td height="3" style="background: linear-gradient(90deg, #A68A7C, #f8fafc, #A68A7C);"></td>
                  </tr>

                  <!-- Header / Brand -->
                  <tr>
                    <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #18181b;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div style="font-size: 15px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: #f8fafc;">
                              TAPECUT STUDIOS
                            </div>
                            <div style="font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #71717a; margin-top: 4px;">
                              Identity &amp; Access Governance
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; padding: 4px 10px; background-color: rgba(166, 138, 124, 0.12); border: 1px solid rgba(166, 138, 124, 0.35); border-radius: 4px; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #d4b8a8;">
                              RESTRICTED
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 36px 40px 28px 40px;">
                      <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #A68A7C;">
                        One-Time Passcode Request
                      </p>
                      <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3; color: #ffffff; letter-spacing: -0.5px;">
                        Authorize Terminal Session
                      </h1>
                      <p style="margin: 0 0 32px 0; font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
                        An authentication challenge was requested for account access. Provide the single-use authorization token below to confirm your session credentials.
                      </p>

                      <!-- Big Numeric OTP Container -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                        <tr>
                          <td align="center" style="background-color: #050506; border: 1px solid #27272a; border-radius: 8px; padding: 26px 20px;">
                            <div style="font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #f4f4f5; padding-left: 12px;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Telemetry & Security Notice Table -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121215; border: 1px solid #1c1c21; border-radius: 6px; padding: 14px 18px; margin-bottom: 8px;">
                        <tr>
                          <td width="50%" style="font-size: 11px; color: #71717a; line-height: 1.5;">
                            Valid For: <strong style="color: #e4e4e7;">10 Minutes</strong><br>
                            Single Use: <strong style="color: #e4e4e7;">Invalidated After Entry</strong>
                          </td>
                          <td width="50%" align="right" style="font-size: 11px; color: #71717a; line-height: 1.5;">
                            Recipient: <strong style="color: #e4e4e7;">${email}</strong><br>
                            Encryption: <strong style="color: #10b981;">TLS 1.3 End-to-End</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px 32px 40px; background-color: #08080a; border-top: 1px solid #18181b;">
                      <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.5; color: #52525b;">
                        If you did not initiate this authentication request, disregard this message. Account credentials will remain locked until validated.
                      </p>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #3f3f46; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                            &copy; ${new Date().getFullYear()} TAPECUT STUDIOS LLC. ALL RIGHTS RESERVED.
                          </td>
                          <td align="right" style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #52525b; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                            CONFIDENTIAL
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      // Inside sendAdminDealAlert:
sender: { name: "Tapecut Executive Ledger", email: "auth@tapecut.info" },
      to: recipients,
      subject: `[DEAL COMMITTED] ₹${dealDetails.contract_value.toLocaleString()} — ${dealDetails.client_name}`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Executive Ledger Update</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 12px; overflow: hidden;">
                  
                  <tr>
                    <td height="3" style="background: linear-gradient(90deg, #10b981, #059669);"></td>
                  </tr>

                  <tr>
                    <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid #18181b;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div style="font-size: 14px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #f8fafc;">
                              TAPECUT STUDIOS
                            </div>
                            <div style="font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #10b981; margin-top: 4px;">
                              Deal Commitment Alert
                            </div>
                          </td>
                          <td align="right">
                            <span style="font-size: 20px; font-weight: 800; color: #10b981; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                              ₹${dealDetails.contract_value.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 32px 36px;">
                      <p style="margin: 0 0 20px 0; font-size: 13.5px; color: #a1a1aa; line-height: 1.5;">
                        A sales operator logged a closed deal into the agency registry.
                      </p>

                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 10px 0; color: #71717a; border-bottom: 1px solid #1a1a1e;">Client Name</td>
                          <td style="padding: 10px 0; color: #ffffff; font-weight: 600; text-align: right; border-bottom: 1px solid #1a1a1e;">${dealDetails.client_name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #71717a; border-bottom: 1px solid #1a1a1e;">Contact Phone</td>
                          <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid #1a1a1e;">${dealDetails.client_phone || "Not Specified"}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #71717a; border-bottom: 1px solid #1a1a1e;">Project Scope</td>
                          <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid #1a1a1e;">${dealDetails.scope}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #71717a; border-bottom: 1px solid #1a1a1e;">Buffer Window</td>
                          <td style="padding: 10px 0; color: #f59e0b; font-weight: 600; text-align: right; border-bottom: 1px solid #1a1a1e;">${dealDetails.buffer_time}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #71717a;">Sales Operator</td>
                          <td style="padding: 10px 0; color: #ffffff; text-align: right;">${dealDetails.sales_rep_email}</td>
                        </tr>
                      </table>

                      <div style="background-color: #070709; border: 1px solid #1f1f23; border-radius: 6px; padding: 16px;">
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #71717a; margin-bottom: 6px;">
                          Operator Notes &amp; Specifications
                        </div>
                        <div style="font-size: 12.5px; line-height: 1.6; color: #d4d4d8; white-space: pre-wrap;">${dealDetails.description || "No project notes supplied."}</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px 36px; background-color: #08080a; border-top: 1px solid #18181b; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #3f3f46; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                      TAPECUT AGENCY TELEMETRY // INTERNAL DISTRIBUTION ONLY
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo Deal Alert Rejection:", errorText);
  }
}