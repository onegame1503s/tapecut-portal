"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ShieldAlert } from "lucide-react";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) setStep("otp");
      else setError(data.error || "Failed to dispatch token.");
    } catch {
      setError("Network integrity failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      if (res.ok && data.redirect) {
        router.push(data.redirect);
      } else {
        setError(data.error || "Invalid token.");
      }
    } catch {
      setError("Network integrity failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] flex flex-col items-center justify-center font-mono selection:bg-white selection:text-black p-6">
      <div className="w-full max-w-md">
        
        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Tapecut<span className="text-neutral-500">_Ops</span></h1>
          <p className="text-xs text-neutral-500 tracking-widest uppercase">Secured Intranet Gateway // Delhi HQ</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-950/50 border border-red-900 text-red-500 p-4 mb-6 text-sm flex items-center gap-3"
            >
              <ShieldAlert className="w-4 h-4" /> {error}
            </motion.div>
          )}

          {step === "email" ? (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} 
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Operator Email</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-white p-4 text-white outline-none transition-colors"
                  placeholder="name@tapecut.info"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold uppercase tracking-widest p-4 hover:bg-neutral-300 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Token <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOTP} 
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Authorization Token</label>
                <p className="text-xs text-neutral-600 mb-4">Dispatched to {email}</p>
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-white p-4 text-3xl tracking-[1em] text-center text-white outline-none transition-colors"
                  placeholder="------"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full bg-white text-black font-bold uppercase tracking-widest p-4 hover:bg-neutral-300 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep("email")}
                className="w-full text-xs text-neutral-500 uppercase tracking-widest hover:text-white transition-colors mt-4"
              >
                ← Change Email
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}