"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, DollarSign, LogOut, Loader2, ArrowUpRight, UserPlus, Target, ClipboardPaste, X, ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, MapPin, Globe, CreditCard, Save, Trash2, Bell, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Whitelist Form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("sales");
  const [isAdding, setIsAdding] = useState(false);

  // Modals
  const [viewingRep, setViewingRep] = useState<any>(null);
  const [assigningToRep, setAssigningToRep] = useState<any>(null);
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Assignment Form
  const [leadForm, setLeadForm] = useState({
    business_name: "", category: "", phone_number: "", address: "", 
    website_health: "", priority: "", recommended_pitch: "", 
    google_maps_url: "", discovered_website: "", demo_page: ""
  });
  const [assigningLead, setAssigningLead] = useState(false);
  
  const router = useRouter();

  const fetchData = async () => {
    try {
      // Added userRes back to the array and fetch list
      const [userRes, dealRes, leadRes, pricingRes, msgRes] = await Promise.all([
        fetch("/api/portal/admin/users", { cache: "no-store" }),
        fetch("/api/portal/deals", { cache: "no-store" }),
        fetch("/api/portal/leads", { cache: "no-store" }),
        fetch("/api/portal/pricing", { cache: "no-store" }),
        fetch("/api/portal/messages", { cache: "no-store" })
      ]);

      const userData = await userRes.json(); if (userData.success) setUsers(userData.users);
      const dealData = await dealRes.json(); if (dealData.success) setDeals(dealData.deals);
      const leadData = await leadRes.json(); if (leadData.success) setLeads(leadData.leads);
      const pricingData = await pricingRes.json(); if (pricingData.success) setPricing(pricingData.pricing);
    } catch {
      console.error("Failed to load telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const res = await fetch("/api/portal/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...updates }) });
      if (res.ok) fetchData();
    } catch { alert("Network synchronization error."); }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault(); setIsAdding(true);
    try {
      const res = await fetch("/api/portal/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail, role: newRole }) });
      if (res.ok) { setNewEmail(""); fetchData(); } else alert("Failed to add operator.");
    } finally { setIsAdding(false); }
  };

  // --- NEW: INTELLIGENT HEURISTIC PARSER ---
  const handlePasteRawData = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("Text");
    
    // Split by tab or newline and filter out empty or "None" strings
    const parts = pastedText.split(/[\t\n]+/).map(p => p.trim()).filter(p => p.length > 0 && !/^(none|n\/a|-|null)$/i.test(p));
    
    let extracted = {
      business_name: "", category: "", phone_number: "", address: "", 
      website_health: "", priority: "", recommended_pitch: "", 
      google_maps_url: "", discovered_website: ""
    };

    const unassigned: string[] = [];

    // Analyze each piece of pasted data to figure out what it is regardless of order
    parts.forEach(str => {
      if (/google\.com\/maps|maps\.app\.goo\.gl/i.test(str)) {
        extracted.google_maps_url = str;
      } else if (/^https?:\/\//i.test(str)) {
        extracted.discovered_website = str;
      } else if (/^[+\d\s\-\.()]{8,18}$/.test(str) && /\d{4}/.test(str)) {
        extracted.phone_number = str;
      } else if (/(high|medium|low|urgent)/i.test(str) && str.length < 25) {
        extracted.priority = str;
      } else if (/(no standalone|poor|average|good|excellent|needs improvement)/i.test(str) && str.length < 35) {
        extracted.website_health = str;
      } else if (/(floor|shop|mall|road|street|nagar|delhi|kunj|block|sector|phase|marg)/i.test(str) && str.length > 10 && !/(pitch|offer|propose)/i.test(str)) {
        extracted.address = str;
      } else if (/(pitch|portfolio|booking|seo|next\.js|website|setup|build|offer|propose)/i.test(str) && str.length > 15) {
        extracted.recommended_pitch = str;
      } else {
        unassigned.push(str);
      }
    });

    // Fill in remaining text fields with unclassified data
    unassigned.forEach(str => {
      if (!extracted.business_name) extracted.business_name = str;
      else if (!extracted.category) extracted.category = str;
      else if (!extracted.recommended_pitch) extracted.recommended_pitch += (extracted.recommended_pitch ? " " : "") + str;
      else if (!extracted.address) extracted.address += (extracted.address ? " " : "") + str;
    });

    setLeadForm(prev => ({
      ...prev,
      ...extracted
    }));
  };
  // -----------------------------------------

  const handleAssignLead = async (e: React.FormEvent) => {
    e.preventDefault(); setAssigningLead(true);
    try {
      const res = await fetch("/api/portal/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sales_rep_id: assigningToRep.id, ...leadForm }) });
      if (res.ok) {
        setAssigningToRep(null);
        setLeadForm({ business_name: "", category: "", phone_number: "", address: "", website_health: "", priority: "", recommended_pitch: "", google_maps_url: "", discovered_website: "", demo_page: "" });
        fetchData();
      }
    } finally { setAssigningLead(false); }
  };

  // --- NEW: DELETE DEAL ---
  const handleDeleteDeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal? This action is irreversible.")) return;
    try {
      await fetch(`/api/portal/deals?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch { alert("Failed to delete deal."); }
  };

  // --- NEW: DELETE TARGET/LEAD ---
  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target? This action is irreversible.")) return;
    try {
      await fetch(`/api/portal/leads?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch { alert("Failed to delete target."); }
  };

  // --- NEW: REASSIGN/REVOKE LEAD ---
  const handleReassignLead = async (leadId: string, newRepId: string) => {
    if (!newRepId) return;
    if (!confirm(newRepId === "unassigned" ? "Revoke this target?" : "Reassign this target?")) return;
    try {
      const payload = newRepId === "unassigned" 
        ? { lead_id: leadId, sales_rep_id: null, status: 'pending' } 
        : { lead_id: leadId, sales_rep_id: newRepId, status: 'assigned' };
        
      await fetch("/api/portal/leads", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      fetchData();
      setViewingRep(null); // Close modal to refresh UI cleanly
    } catch { alert("Failed to modify assignment."); }
  };

  // --- NEW: SEND REMINDER (Raghav Singhania) ---
  const handleSendReminder = async (repId: string, leadName: string) => {
    const ADMIN_UUID = "d07c417d-d388-4abc-8176-058e6640a5f9";
    
    const text = `URGENT: Status update required for ${leadName} via tapecut.info infrastructure.\n\nPlease provide an immediate status report on this assigned task.\n\nBest,\nRaghav Singhania`;
    
    try {
      const res = await fetch("/api/portal/messages", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ sender_id: ADMIN_UUID, receiver_id: repId, message_text: text }) 
      });
      if (res.ok) alert("Reminder dispatched successfully.");
      else alert("Failed to dispatch reminder.");
    } catch { alert("Network error."); }
  };

  const handleUpdatePricing = async (plan: any) => {
    try {
      const res = await fetch("/api/portal/pricing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(plan) });
      if (res.ok) alert(`Updated ${plan.tier_level} successfully.`);
      else alert("Failed to update tier.");
    } catch { alert("Network Error"); }
  };

  const handlePricingChange = (id: string, field: string, value: string | number) => {
    setPricing(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleLogout = async () => {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  // Metrics Calculations
  const salesReps = users.filter(u => u.role === "sales" && u.status === "approved");
  const totalPipelineRevenue = deals.reduce((acc, deal) => acc + Number(deal.contract_value || 0), 0);
  const totalClosedDeals = deals.length;
  const acceptedDeals = leads.filter(l => l.status === 'accepted').length;
  const pendingDeals = leads.filter(l => l.status === 'assigned').length;
  const totalLeads = leads.length;

  const getRepStats = (repId: string) => {
    const repLeads = leads.filter(l => l.sales_rep_id === repId);
    return {
      total: repLeads.length, pending: repLeads.filter(l => l.status === 'assigned').length,
      accepted: repLeads.filter(l => l.status === 'accepted').length, denied: repLeads.filter(l => l.status === 'denied').length,
      leads: repLeads
    };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] p-8 font-mono selection:bg-white selection:text-black">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black p-2.5"><Shield className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Tapecut HQ // Admin Command</h1>
            <p className="text-xs text-neutral-500">Global Pipeline Control & Access Governance</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 text-xs font-bold uppercase transition-colors"><LogOut className="w-4 h-4" /> Terminate Session</button>
      </div>

      {/* NEW: ADVANCED METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-4">
          <p className="text-[10px] text-emerald-500 uppercase tracking-widest mb-1 font-bold">Total Revenue Made</p>
          <h3 className="text-2xl font-black text-emerald-400">₹{totalPipelineRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Closed Deals (Contracts)</p>
          <h3 className="text-2xl font-black text-white">{totalClosedDeals}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Accepted Deals</p>
          <h3 className="text-2xl font-black text-blue-400">{acceptedDeals}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Total Pending Deals</p>
          <h3 className="text-2xl font-black text-yellow-500">{pendingDeals}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Total Deals To Be Made</p>
          <h3 className="text-2xl font-black text-white">{totalLeads}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Registered Operators</p>
          <h3 className="text-2xl font-black text-white">{users.length}</h3>
        </div>
      </div>

      {/* SALES OPERATIVES GRID */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 mb-12 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-black uppercase tracking-wider text-blue-400">Sales Operative Target Matrix</h2>
        </div>
        <p className="text-xs text-neutral-500 mb-4">Click an active sales operative to view their pipeline stats or assign new targets.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {salesReps.map(rep => {
            const stats = getRepStats(rep.id);
            return (
              <button key={rep.id} onClick={() => setViewingRep(rep)} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 text-left transition-colors relative">
                <span className="block text-[10px] text-blue-400 font-bold uppercase mb-1">Active Operative</span>
                <span className="block text-sm font-bold truncate">{rep.email}</span>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400">{stats.total} Total</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-900/30 text-yellow-500">{stats.pending} Pend</span>
                </div>
              </button>
            )
          })}
          {salesReps.length === 0 && <p className="text-xs text-neutral-500">No active sales operatives available.</p>}
        </div>
      </div>

      {/* PRICING CONFIGURATOR */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 mb-12 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-black uppercase tracking-wider text-emerald-400">Global Pricing & Tier Configurator</h2>
        </div>
        <p className="text-xs text-neutral-500 mb-6">Customize the money tiers for Column A (Small Shops) and Column B (Big Shops). Changes instantly update on all seller dashboards.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column A */}
          <div>
            <h3 className="text-md font-black uppercase tracking-widest text-white mb-4 bg-neutral-900 p-3 border border-neutral-800">Column A (Small Shop) Tiers</h3>
            <div className="space-y-4">
              {pricing.filter(p => p.shop_size.includes("Column A")).map(plan => (
                <div key={plan.id} className="bg-black border border-neutral-800 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-emerald-400">{plan.tier_level}</span>
                    <button onClick={() => handleUpdatePricing(plan)} className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-white px-2 py-1 uppercase font-bold border border-neutral-700 flex items-center gap-1"><Save className="w-3 h-3"/> Save</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="block text-[10px] uppercase text-neutral-500 mb-1">Tier Name</label><input type="text" value={plan.name} onChange={e=>handlePricingChange(plan.id, 'name', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" /></div>
                    <div><label className="block text-[10px] uppercase text-neutral-500 mb-1">Upfront (₹)</label><input type="number" value={plan.upfront_price} onChange={e=>handlePricingChange(plan.id, 'upfront_price', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" /></div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Monthly Sub (₹)</label><input type="number" value={plan.monthly_price} onChange={e=>handlePricingChange(plan.id, 'monthly_price', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Features Included</label><textarea rows={2} value={plan.features} onChange={e=>handlePricingChange(plan.id, 'features', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column B */}
          <div>
            <h3 className="text-md font-black uppercase tracking-widest text-white mb-4 bg-neutral-900 p-3 border border-neutral-800">Column B (Big Shop) Tiers</h3>
            <div className="space-y-4">
              {pricing.filter(p => p.shop_size.includes("Column B")).map(plan => (
                <div key={plan.id} className="bg-black border border-neutral-800 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-emerald-400">{plan.tier_level}</span>
                    <button onClick={() => handleUpdatePricing(plan)} className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-white px-2 py-1 uppercase font-bold border border-neutral-700 flex items-center gap-1"><Save className="w-3 h-3"/> Save</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="block text-[10px] uppercase text-neutral-500 mb-1">Tier Name</label><input type="text" value={plan.name} onChange={e=>handlePricingChange(plan.id, 'name', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" /></div>
                    <div><label className="block text-[10px] uppercase text-neutral-500 mb-1">Upfront (₹)</label><input type="number" value={plan.upfront_price} onChange={e=>handlePricingChange(plan.id, 'upfront_price', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" /></div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Monthly Sub (₹)</label><input type="number" value={plan.monthly_price} onChange={e=>handlePricingChange(plan.id, 'monthly_price', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Features Included</label><textarea rows={2} value={plan.features} onChange={e=>handlePricingChange(plan.id, 'features', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-white resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CLEARANCE CONTROL */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 mb-12">
        <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2"><Users className="w-5 h-5" /> Operator Clearance Control</h2>
        <form onSubmit={handleAddOperator} className="flex flex-col md:flex-row gap-4 mb-8 bg-black border border-neutral-900 p-4">
          <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="operator@tapecut.info" className="flex-1 bg-neutral-950 border border-neutral-800 p-3 text-sm text-white" />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="bg-neutral-950 border border-neutral-800 p-3 text-xs font-bold text-white uppercase"><option value="sales">Sales Operator</option><option value="admin">Executive Admin</option></select>
          <button type="submit" disabled={isAdding} className="bg-white text-black px-6 py-3 text-xs font-bold uppercase">{isAdding ? "Working..." : "Whitelist"}</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase"><th className="pb-3">Operator Email</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-neutral-900 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-900/40">
                  <td className="py-4 font-bold">{u.email}</td>
                  <td className="py-4"><select value={u.role} onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })} className="bg-black border border-neutral-800 p-2 text-xs font-bold text-white uppercase"><option value="sales">Sales</option><option value="admin">Admin</option></select></td>
                  <td className="py-4"><span className={`px-2 py-1 text-[10px] font-bold uppercase ${u.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>{u.status}</span></td>
                  <td className="py-4 text-right space-x-2">
                    {u.status !== 'suspended' && <button onClick={() => handleUpdateUser(u.id, { status: 'suspended' })} className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1.5 text-xs font-bold uppercase transition-colors">Suspend</button>}
                    {u.status === 'suspended' && <button onClick={() => handleUpdateUser(u.id, { status: 'approved' })} className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 text-xs font-bold uppercase transition-colors">Restore</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MASTER DEALS LEDGER */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6">
        <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-neutral-400" /> Agency Master Deals Ledger & Specs</h2>
        {deals.length === 0 ? <p className="text-xs text-neutral-500 py-4">No deals logged across the agency yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase"><th className="pb-3">Client & Contact</th><th className="pb-3">Scope</th><th className="pb-3">Value</th><th className="pb-3 text-right">Logged By</th></tr></thead>
              <tbody className="divide-y divide-neutral-900 text-sm">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-900/40 cursor-pointer" onClick={() => setExpandedDealId(expandedDealId === d.id ? null : d.id)}>
                    <td className="py-4">
                      <div className="flex items-center gap-2 font-bold text-white">{d.client_name}{expandedDealId === d.id ? <ChevronUp className="w-4 h-4 text-neutral-500"/> : <ChevronDown className="w-4 h-4 text-neutral-500"/>}</div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-1">{d.client_phone || "No phone"}</div>
                      {expandedDealId === d.id && (
                        <div className="mt-4 mb-2 bg-neutral-950 p-4 border border-neutral-800 text-xs text-neutral-300 max-w-lg animate-in fade-in">
                          <span className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Buffer: <span className="text-yellow-500 ml-1">{d.buffer_time}</span></span>
                          <span className="block text-[10px] uppercase text-neutral-500 font-bold mt-4 mb-2">Notes</span>{d.description || "No description provided."}
                          {/* NEW: DELETE DEAL BUTTON */}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteDeal(d.id); }} className="text-red-500 hover:text-red-400 flex items-center gap-1 text-[10px] uppercase font-bold mt-6 border border-red-900/50 bg-red-950/20 px-3 py-1.5 w-fit">
                            <Trash2 className="w-3 h-3"/> Delete Record
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-neutral-300 text-xs align-top">{d.scope}</td>
                    <td className="py-4 font-black text-emerald-400 align-top">₹{Number(d.contract_value).toLocaleString()}</td>
                    <td className="py-4 text-right text-xs text-neutral-500 align-top">{d.profiles?.email || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: OPERATIVE PROFILE */}
      {viewingRep && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center bg-neutral-900 p-6 border-b border-neutral-800">
              <div><h3 className="font-black text-xl uppercase tracking-widest text-white">{viewingRep.email}</h3><p className="text-xs text-blue-400 uppercase font-bold mt-1 tracking-widest">Operative Dossier</p></div>
              <button onClick={() => setViewingRep(null)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-neutral-950 border border-neutral-900 p-4"><div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Total Assigned</div><div className="text-3xl font-black text-white">{getRepStats(viewingRep.id).total}</div></div>
                <div className="bg-neutral-950 border border-neutral-900 p-4"><div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Pending</div><div className="text-3xl font-black text-yellow-500">{getRepStats(viewingRep.id).pending}</div></div>
                <div className="bg-neutral-950 border border-neutral-900 p-4"><div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Accepted</div><div className="text-3xl font-black text-emerald-500">{getRepStats(viewingRep.id).accepted}</div></div>
                <div className="bg-neutral-950 border border-neutral-900 p-4"><div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Denied</div><div className="text-3xl font-black text-red-500">{getRepStats(viewingRep.id).denied}</div></div>
              </div>
              <div className="flex justify-between items-center mb-4 border-b border-neutral-900 pb-4">
                <h4 className="font-bold uppercase text-sm text-neutral-400">Assigned Targets</h4>
                <button onClick={() => { setViewingRep(null); setAssigningToRep(viewingRep); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold uppercase">+ Deploy New Target</button>
              </div>
              <div className="space-y-3">
                {getRepStats(viewingRep.id).leads.length === 0 && <p className="text-xs text-neutral-600 italic">No targets assigned.</p>}
                {getRepStats(viewingRep.id).leads.map(lead => (
                  <div key={lead.id} className="bg-neutral-950 border border-neutral-900 p-4 transition-all">
                    <div className="flex justify-between items-center cursor-pointer select-none group" onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                      <div className="flex items-center gap-4">
                        {lead.status === 'accepted' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {lead.status === 'denied' && <XCircle className="w-5 h-5 text-red-500" />}
                        {lead.status === 'assigned' && <div className="w-5 h-5 rounded-full border border-neutral-700 border-dashed" />}
                        <div><h3 className={`font-bold uppercase tracking-wider ${lead.status === 'denied' ? 'text-neutral-600 line-through' : 'text-white'}`}>{lead.business_name}</h3></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">{lead.status}</span>
                        {expandedLeadId === lead.id ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                      </div>
                    </div>
                    {expandedLeadId === lead.id && (
                      <div className="mt-4 pt-4 border-t border-neutral-900 text-xs text-neutral-400 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                        <div><span className="font-bold text-neutral-600 uppercase block text-[10px] mb-1">Phone</span> <span className="text-white">{lead.phone_number || "—"}</span></div>
                        <div><span className="font-bold text-neutral-600 uppercase block text-[10px] mb-1">Health</span> <span className="text-yellow-500">{lead.website_health || "—"}</span></div>
                        <div className="col-span-1 md:col-span-2"><span className="font-bold text-neutral-600 uppercase block text-[10px] mb-1">Address</span> <span className="text-white">{lead.address || "—"}</span></div>
                        <div className="col-span-1 md:col-span-2 bg-black p-4 border border-neutral-800">
                          <span className="block text-[10px] uppercase text-neutral-600 font-bold mb-2">Pitch Strategy</span>
                          <span className="text-neutral-300">{lead.recommended_pitch || "—"}</span>
                        </div>
                        
                        {/* NEW: TARGET CONTROL PANEL (REMIND, REASSIGN, DELETE) */}
                        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-900">
                          <button onClick={() => handleSendReminder(viewingRep.id, lead.business_name)} className="bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-900 px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1 transition-colors">
                            <Bell className="w-3 h-3"/> Remind
                          </button>
                          
                          <select onChange={(e) => handleReassignLead(lead.id, e.target.value)} className="bg-black border border-neutral-800 text-neutral-400 px-3 py-1.5 text-[10px] font-bold uppercase outline-none focus:border-white transition-colors">
                            <option value="">Reassign Target...</option>
                            <option value="unassigned">Revoke (Unassign)</option>
                            {salesReps.filter(r => r.id !== viewingRep.id).map(r => (
                              <option key={r.id} value={r.id}>Transfer to: {r.email}</option>
                            ))}
                          </select>
                          
                          <button onClick={() => handleDeleteLead(lead.id)} className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1 ml-auto transition-colors">
                            <Trash2 className="w-3 h-3"/> Delete Target
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TARGET FORM */}
      {assigningToRep && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-neutral-900 p-4 border-b border-neutral-800">
              <div><h3 className="font-black uppercase text-blue-400">Deploy Target Data</h3><p className="text-xs text-neutral-400 mt-1">Deploying to: {assigningToRep.email}</p></div>
              <button onClick={() => { setAssigningToRep(null); setViewingRep(assigningToRep); }} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2"><ClipboardPaste className="w-4 h-4" /> Auto-Parse (Paste row from Sheets)</label>
                <textarea rows={2} onPaste={handlePasteRawData} placeholder="Ctrl+V to paste a row..." className="w-full bg-black border border-blue-900 focus:border-blue-500 p-4 text-sm text-blue-200 outline-none resize-none transition-colors" />
              </div>
              <form onSubmit={handleAssignLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Business Name *</label><input type="text" value={leadForm.business_name} onChange={e=>setLeadForm({...leadForm, business_name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none" required /></div>
                  <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Phone Number</label><input type="text" value={leadForm.phone_number} onChange={e=>setLeadForm({...leadForm, phone_number: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none" /></div>
                  <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Category</label><input type="text" value={leadForm.category} onChange={e=>setLeadForm({...leadForm, category: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none" /></div>
                  <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Priority Level</label><input type="text" value={leadForm.priority} onChange={e=>setLeadForm({...leadForm, priority: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none" /></div>
                </div>
                <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Physical Address</label><input type="text" value={leadForm.address} onChange={e=>setLeadForm({...leadForm, address: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none" /></div>
                <div><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Recommended Pitch</label><textarea rows={2} value={leadForm.recommended_pitch} onChange={e=>setLeadForm({...leadForm, recommended_pitch: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm text-white outline-none resize-none" /></div>
                <div className="border-t border-neutral-800 pt-6 mt-6">
                  <label className="text-xs uppercase text-blue-400 font-bold tracking-widest mb-2 flex items-center gap-2"><ExternalLink className="w-4 h-4"/> Demo Page (Vercel URL)</label>
                  <input type="url" value={leadForm.demo_page} onChange={e=>setLeadForm({...leadForm, demo_page: e.target.value})} placeholder="https://demo.vercel.app" className="w-full bg-blue-950/20 border border-blue-900 focus:border-blue-500 p-4 text-sm text-white outline-none" />
                </div>
                <button type="submit" disabled={assigningLead} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase p-4 mt-6 flex justify-center items-center gap-2">{assigningLead ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Target"}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}