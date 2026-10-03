"use client";

import { motion } from "framer-motion";
import { Shield, UserCheck, ArrowRight, ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";

export default function PortalGateway() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono flex flex-col justify-between p-8 md:p-16 selection:bg-white selection:text-black">
      
      {/* Top Bar: Integration Link to tapecut.info */}
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs tracking-widest text-neutral-400 uppercase">Tapecut Studios // Intranet Gateway</span>
        </div>
        <a 
          href="https://tapecut.info" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors border border-neutral-800 bg-neutral-950 px-4 py-2"
        >
          <span>tapecut.info</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Hero Section / Gateway Cards */}
      <div className="max-w-4xl mx-auto w-full py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Internal Operations <span className="text-neutral-600">Portal</span>
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            Secure clearance required. Choose your operational terminal below to authenticate via your cryptographic email token.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Sales Terminal Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#0a0a0a] border border-neutral-800 p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/50 border border-blue-900 px-2.5 py-1 inline-block mb-3">
                Sales Clearance
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Sales Terminal</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-8">
                Log closed contracts, track individual contract volume, and review historical pipeline conversion metrics.
              </p>
            </div>
            <Link 
              href="/portal/login"
              className="w-full bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 font-bold uppercase tracking-widest text-xs p-4 transition-all flex justify-between items-center"
            >
              <span>Access Sales Node</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Admin Command Center Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#0a0a0a] border border-neutral-800 p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/50 border border-emerald-900 px-2.5 py-1 inline-block mb-3">
                Executive Clearance
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Admin Command</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-8">
                Global revenue oversight, operator privilege governance, account approvals, and agency master ledger control.
              </p>
            </div>
            <Link 
              href="/portal/login"
              className="w-full bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 font-bold uppercase tracking-widest text-xs p-4 transition-all flex justify-between items-center"
            >
              <span>Access Admin Core</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 border-t border-neutral-900 pt-6 text-xs text-neutral-500">
        <p>© 2026 Tapecut Studios. All rights reserved. Delhi, India.</p>
        <div className="flex items-center gap-2 text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted via Brevo & Supabase Edge</span>
        </div>
      </div>

    </div>
  );
}