"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-neutral-800 p-8 space-y-6">
        <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto rounded-full text-yellow-500 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">Access Pending</h1>
        
        <p className="text-sm text-neutral-400">
          Your identity has been cryptographically verified, but your clearance level is <span className="text-yellow-500 font-bold">PENDING_APPROVAL</span>.
        </p>
        
        <p className="text-xs text-neutral-500">
          Contact a System Administrator at Tapecut Studios to elevate your clearance.
        </p>
        
        <button 
          onClick={handleLogout}
          disabled={loading}
          className="mt-8 w-full bg-transparent border border-neutral-700 text-neutral-400 hover:text-white hover:border-white font-bold uppercase tracking-widest p-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" /> {loading ? "Terminating..." : "Terminate Session"}
        </button>
      </div>
    </div>
  );
}