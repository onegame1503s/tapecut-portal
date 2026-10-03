import Link from "next/link";
import { ArrowRight, Shield, Terminal, Code2, Cpu } from "lucide-react";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono selection:bg-white selection:text-black flex flex-col justify-between p-8 md:p-16">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs tracking-widest text-neutral-400 uppercase font-bold">Tapecut Studios // Delhi HQ</span>
        </div>
        <Link 
          href="/portal"
          className="flex items-center gap-2 text-xs text-black bg-white hover:bg-neutral-200 font-bold px-4 py-2.5 transition-colors uppercase tracking-widest"
        >
          <span>Intranet Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto w-full py-20 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-widest mb-6">
          <Code2 className="w-3.5 h-3.5 text-blue-500" /> Full-Stack Web Development Agency
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
          High-Performance <br /><span className="text-neutral-600">Digital Architecture</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          We engineer bespoke web applications, high-converting platforms, and scalable internal infrastructure for modern enterprises from Delhi, India.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/portal"
            className="bg-white text-black font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-neutral-200 transition-colors flex items-center gap-2"
          >
            <span>Access Team Portal</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 border-t border-neutral-900 pt-6 text-xs text-neutral-500">
        <p>© 2026 Tapecut Studios. All rights reserved.</p>
        <div className="flex items-center gap-2 text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Next.js App Router // Supabase Edge</span>
        </div>
      </div>

    </div>
  );
}