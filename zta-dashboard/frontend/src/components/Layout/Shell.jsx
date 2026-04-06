import React from 'react'
import Sidebar from './Sidebar.jsx'

export default function Shell({ children }) {
  return (
    <div className="flex bg-[#0d1117] min-h-screen">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar (optional, used for search/user/global actions) */}
        <header className="h-16 border-b border-[#30363d] flex items-center justify-between px-6 bg-[#161b22]/30 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
             {/* Dynamic Breadcrumbs could be added here */}
             <span className="text-[#8b949e] text-xs font-medium uppercase tracking-widest">Global Risk Monitor</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-[#0d1117] border border-[#30363d] px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></div>
                <span className="ml-2 text-[10px] font-bold text-[#3fb950] uppercase tracking-tighter">System Normal</span>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto animate-fade-in">
           {children}
        </div>

        {/* Footer info (optional) */}
        <footer className="h-8 border-t border-[#30363d] flex items-center px-6 bg-[#0a0c10]/50 text-[10px] text-[#484f58] font-mono tracking-tighter">
           ZTA ANALYTICS PLATFORM // V1.0.0 // ENCRYPTION AES-256-GCM
        </footer>
      </main>
    </div>
  )
}
