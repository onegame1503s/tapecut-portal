export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono selection:bg-white selection:text-black">
      {children}
    </div>
  );
}   