"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, DollarSign, LogOut, Loader2, ArrowUpRight, UserCheck, Target, ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, MapPin, Globe, CreditCard, Bell, MessageSquare, Clock, HelpCircle, Send, X, Shield } from "lucide-react";

export default function SalesDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const router = useRouter();

  // --- NEW: NOTIFICATIONS STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [customReplies, setCustomReplies] = useState<{[key: string]: string}>({});

  const [form, setForm] = useState({
    client_name: "", client_phone: "", contract_value: "",
    scope: "Full-Stack Web App (Next.js)", buffer_time: "3-5 Business Days", description: "",
  });

  const fetchData = async () => {
    try {
      const [dealRes, leadRes, pricingRes, msgRes] = await Promise.all([
        fetch("/api/portal/deals"),
        fetch("/api/portal/leads"),
        fetch("/api/portal/pricing"),
        fetch("/api/portal/messages") // Fetches inbox
      ]);

      const dealData = await dealRes.json(); if (dealData.success) setDeals(dealData.deals);
      const leadData = await leadRes.json(); if (leadData.success) setLeads(leadData.leads);
      const pricingData = await pricingRes.json(); if (pricingData.success) setPricing(pricingData.pricing);
      
      // Fetch messages without crashing if the endpoint isn't fully ready
      try {
        const msgData = await msgRes.json();
        if (msgData.success && msgData.messages) setMessages(msgData.messages);
      } catch (e) { console.log("Messages API not yet deployed"); }
      
    } catch {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/portal/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        setForm({ client_name: "", client_phone: "", contract_value: "", scope: "Full-Stack Web App (Next.js)", buffer_time: "3-5 Business Days", description: "" });
        fetchData();
      } else alert("Failed to log deal.");
    } catch { alert("Network error."); } finally { setSubmitting(false); }
  };

  const handleUpdateLeadStatus = async (lead_id: string, status: string) => {
    try {
      const res = await fetch("/api/portal/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_id, status }) });
      if (res.ok) fetchData();
    } catch { alert("Failed to update status."); }
  };

  const handleLogout = async () => {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  // --- NEW: SEND REPLY ---
  const handleSendReply = async (msgId: string, text: string) => {
    try {
      await fetch("/api/portal/messages", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ sender_id: "sales", receiver_id: "admin", message_text: text }) 
      });
      // Optionally mark as read or remove from UI locally
      setMessages(prev => prev.filter(m => m.id !== msgId));
      alert("Response dispatched to admin.");
    } catch { alert("Network error dispatching response."); }
  };

  const totalSalesRevenue = deals.reduce((acc, deal) => acc + Number(deal.contract_value || 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] p-8 font-mono selection:bg-white selection:text-black">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black p-2.5"><UserCheck className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Tapecut Ops // Sales Terminal</h1>
            <p className="text-xs text-neutral-500">Deal Pipeline & Contract Execution Ledger</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* NEW: NOTIFICATIONS BELL */}
          <button onClick={() => setShowNotifs(true)} className="relative flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <Bell className="w-4 h-4 text-blue-400" /> 
            {messages.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg shadow-red-900/50">{messages.length}</span>}
            Comms
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut className="w-4 h-4" /> Terminate
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Your Total Closed Volume</p>
          <h3 className="text-3xl font-black text-white flex items-center gap-1"><DollarSign className="w-7 h-7 text-emerald-500" /> {totalSalesRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Total Closed Deals</p>
          <h3 className="text-3xl font-black text-white">{deals.length}</h3>
        </div>
      </div>

      {/* PRICING MATRIX REFERENCE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 mb-12 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-black uppercase tracking-wider text-emerald-400">Client Pricing Matrix Reference</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Small Shop */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 bg-neutral-900 p-2 border border-neutral-800 text-center">Column A (Small Shop/Local)</h3>
            <div className="space-y-4">
              {pricing.filter(p => p.shop_size.includes("Column A")).map(plan => (
                <div key={plan.id} className="bg-black border border-neutral-800 p-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{plan.tier_level}</span>
                      <h4 className="text-md font-bold uppercase text-white">{plan.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">₹{Number(plan.upfront_price).toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal uppercase">Upfront</span></div>
                      <div className="text-xs font-bold text-neutral-400">+ ₹{Number(plan.monthly_price).toLocaleString()}/mo <span className="text-[9px] font-normal uppercase">Sub</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-900 mt-2">{plan.features}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Big Shop */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 bg-neutral-900 p-2 border border-neutral-800 text-center">Column B (Big Shop/Enterprise)</h3>
            <div className="space-y-4">
              {pricing.filter(p => p.shop_size.includes("Column B")).map(plan => (
                <div key={plan.id} className="bg-black border border-neutral-800 p-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{plan.tier_level}</span>
                      <h4 className="text-md font-bold uppercase text-white">{plan.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">₹{Number(plan.upfront_price).toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal uppercase">Upfront</span></div>
                      <div className="text-xs font-bold text-neutral-400">+ ₹{Number(plan.monthly_price).toLocaleString()}/mo <span className="text-[9px] font-normal uppercase">Sub</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-900 mt-2">{plan.features}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* TARGETS SECTION */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 mb-8 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-black uppercase tracking-wider text-blue-400">Assigned Targets Pipeline</h2>
        </div>
        
        {leads.length === 0 ? <p className="text-xs text-neutral-500">No active targets assigned.</p> : (
          <div className="grid grid-cols-1 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-black border border-neutral-800 p-5 transition-all">
                <div className="flex justify-between items-center cursor-pointer select-none group" onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                  <div className="flex items-center gap-4">
                    {lead.status === 'accepted' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                    {lead.status === 'denied' && <XCircle className="w-6 h-6 text-red-500" />}
                    {lead.status === 'assigned' && <div className="w-6 h-6 rounded-full border-2 border-neutral-700 border-dashed" />}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-2 py-0.5 bg-neutral-900 text-[10px] text-neutral-400 uppercase tracking-widest border border-neutral-800">{lead.category || "General"}</span>
                        {lead.priority && <span className="px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-900 text-[10px] font-bold uppercase">{lead.priority}</span>}
                      </div>
                      <h3 className={`text-lg font-bold uppercase ${lead.status === 'denied' ? 'text-neutral-600 line-through' : 'text-white'}`}>{lead.business_name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-neutral-500 group-hover:text-white transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest">{lead.status}</span>
                    {expandedLeadId === lead.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {expandedLeadId === lead.id && (
                  <div className="mt-6 pt-6 border-t border-neutral-800 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4 text-sm">
                        <div><span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Phone Number</span><span className="text-white">{lead.phone_number || "—"}</span></div>
                        <div><span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Physical Address</span><span className="text-white">{lead.address || "—"}</span></div>
                        <div><span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Website Health</span><span className="text-yellow-400">{lead.website_health || "—"}</span></div>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div><span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Maps Location</span>{lead.google_maps_url ? <a href={lead.google_maps_url} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1"><MapPin className="w-4 h-4"/> Open in Maps</a> : "—"}</div>
                        <div><span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Discovered Website</span>{lead.discovered_website ? <a href={lead.discovered_website} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1"><Globe className="w-4 h-4"/> Visit Site</a> : "—"}</div>
                      </div>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-900 p-4 text-sm text-neutral-300 mb-6">
                      <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Target Strategy / Pitch Notes</span>{lead.recommended_pitch || "No notes."}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-neutral-800 pt-6">
                      {lead.demo_page ? <a href={lead.demo_page} target="_blank" className="w-full md:w-auto bg-blue-950/30 hover:bg-blue-900/50 border border-blue-900 text-blue-400 text-xs font-bold uppercase tracking-widest px-6 py-3 flex justify-center items-center gap-2"><ExternalLink className="w-4 h-4" /> Present Demo</a> : <div/>}
                      {lead.status === 'assigned' && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button onClick={() => handleUpdateLeadStatus(lead.id, 'denied')} className="flex-1 md:flex-none bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-400 px-6 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Deny</button>
                          <button onClick={() => handleUpdateLeadStatus(lead.id, 'accepted')} className="flex-1 md:flex-none bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 px-6 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Accept</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LOG NEW DEAL FORM */}
        <div className="lg:col-span-1 bg-[#0a0a0a] border border-neutral-800 p-6 h-fit">
          <div className="flex items-center gap-2 mb-6"><PlusCircle className="w-5 h-5 text-neutral-400" /><h2 className="text-lg font-black uppercase tracking-wider">Log Closed Contract</h2></div>
          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Client / Business Name *</label><input type="text" required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white" /></div>
            <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Client Phone Number</label><input type="text" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white" /></div>
            <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Contract Value (₹) *</label><input type="number" required value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white" /></div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Project Scope</label>
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white uppercase text-xs font-bold">
                <option value="Column A - Tier 1">Column A - Tier 1</option><option value="Column A - Tier 2">Column A - Tier 2</option><option value="Column A - Tier 3">Column A - Tier 3</option>
                <option value="Column B - Tier 1">Column B - Tier 1</option><option value="Column B - Tier 2">Column B - Tier 2</option><option value="Column B - Tier 3">Column B - Tier 3</option>
                <option value="Custom Software / Internal Tool">Custom Software / Internal Tool</option>
              </select>
            </div>
            <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Buffer / Delivery Time *</label><input type="text" required value={form.buffer_time} onChange={(e) => setForm({ ...form, buffer_time: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white" /></div>
            <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Description & Scope Notes</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-black border border-neutral-800 p-3 text-sm text-white outline-none focus:border-white resize-none" /></div>
            <button type="submit" disabled={submitting} className="w-full bg-white text-black font-bold uppercase tracking-widest p-4 hover:bg-neutral-300 flex justify-center items-center gap-2 mt-6">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Deal"}</button>
          </form>
        </div>

        {/* PERSONAL DEALS LEDGER */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-6"><ArrowUpRight className="w-5 h-5 text-neutral-400" /><h2 className="text-lg font-black uppercase tracking-wider">Your Closed Contracts Ledger</h2></div>
          {deals.length === 0 ? <p className="text-xs text-neutral-500 py-4">No deals logged under your operator profile yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase"><th className="pb-3">Client Name</th><th className="pb-3">Scope</th><th className="pb-3">Buffer</th><th className="pb-3 text-right">Value</th></tr></thead>
                <tbody className="divide-y divide-neutral-900 text-sm">
                  {deals.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-900/40">
                      <td className="py-4 font-bold">{d.client_name}<div className="text-[10px] text-neutral-500 font-normal">{d.client_phone}</div></td>
                      <td className="py-4 text-neutral-300 text-xs">{d.scope}</td>
                      <td className="py-4 text-yellow-500 text-xs">{d.buffer_time}</td>
                      <td className="py-4 font-black text-emerald-400 text-right">₹{Number(d.contract_value).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- NEW: NOTIFICATIONS SLIDE-OUT PANEL --- */}
      {showNotifs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#0a0a0a] border-l border-neutral-800 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center bg-neutral-900 p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-lg uppercase tracking-widest text-white">Admin Comms</h3>
              </div>
              <button onClick={() => setShowNotifs(false)} className="text-neutral-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {messages.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No incoming directives from HQ.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-neutral-950 border border-neutral-900 p-5 rounded shadow-lg">
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Priority Directive
                    </div>
                    
                    {/* The message from Raghav Singhania */}
                    <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line mb-6 border-l-2 border-blue-900/50 pl-3">
                      {msg.message_text}
                    </p>
                    
                    <div className="border-t border-neutral-900 pt-5">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block mb-3">Quick Response Options</span>
                      
                      {/* Quick Replies */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handleSendReply(msg.id, "On it! Initiating action now.")} className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-2 text-[10px] font-bold uppercase flex items-center gap-1.5 border border-neutral-800 transition-colors">
                          <CheckCircle className="w-3 h-3"/> On It!
                        </button>
                        <button onClick={() => handleSendReply(msg.id, "Following up with the target today.")} className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-2 text-[10px] font-bold uppercase flex items-center gap-1.5 border border-neutral-800 transition-colors">
                          <Clock className="w-3 h-3"/> Follow Up Today
                        </button>
                        <button onClick={() => handleSendReply(msg.id, "Require admin assistance on this.")} className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-2 text-[10px] font-bold uppercase flex items-center gap-1.5 border border-neutral-800 transition-colors">
                          <HelpCircle className="w-3 h-3"/> Need Assist
                        </button>
                      </div>
                      
                      {/* Custom Reply */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Type custom response..." 
                          value={customReplies[msg.id] || ""} 
                          onChange={(e) => setCustomReplies({...customReplies, [msg.id]: e.target.value})} 
                          className="flex-1 bg-black border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-neutral-500 transition-colors" 
                        />
                        <button 
                          onClick={() => { if(customReplies[msg.id]) handleSendReply(msg.id, customReplies[msg.id]); }} 
                          className="bg-white text-black p-2.5 hover:bg-neutral-300 transition-colors flex items-center justify-center"
                        >
                          <Send className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}