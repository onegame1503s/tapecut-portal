import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET_KEY || "tapecut-super-secret-fallback-key-change-in-prod";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id: string;
  email: string;
  role: "admin" | "sales";
  status: "approved" | "pending_approval" | "suspended";
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const session = await encrypt(payload);
  
  (await cookies()).set("tapecut_portal_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).delete("tapecut_portal_session");
}