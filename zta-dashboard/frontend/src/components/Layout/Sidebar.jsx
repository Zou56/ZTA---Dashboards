import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  ShieldAlert, 
  BarChart3, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Search,
  User
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShieldAlert,     label: 'Asset Risk', path: '/assets' },
    { icon: BarChart3,       label: 'Analytics',  path: '/analytics' },
    { icon: Database,        label: 'Datasets',   path: '/datasets' },
    { icon: FileText,        label: 'Reports',    path: '/reports' },
  ]

  return (
    <aside className={`h-screen sticky top-0 bg-[#0d1117] border-r border-[#30363d] transition-all duration-300 flex flex-col z-[100] ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Brand / Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-[#30363d]">
        <div className="w-8 h-8 rounded bg-[#58a6ff] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs">ZT</span>
        </div>
        {!isCollapsed && (
          <div className="ml-3 font-bold text-sm tracking-tight text-white whitespace-nowrap overflow-hidden">
            ANOMALY DASHBOARD
          </div>
        )}
      </div>

      {/* Search Area */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8b949e]" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="w-full bg-[#0d1117] border-[#30363d] pl-9 text-xs focus:ring-1 focus:ring-[#58a6ff]"
            />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-2 space-y-1">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center px-3 py-2.5 rounded-md transition-colors group relative
              ${isActive ? 'bg-[#161b22] text-[#58a6ff]' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#58a6ff]' : 'group-hover:text-[#f0f6fc]'}`} />
                {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-14 bg-[#161b22] border border-[#30363d] px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-4 border-t border-[#30363d]">
        <NavLink 
          to="/settings"
          className={({ isActive }) => `
            w-full flex items-center px-3 py-2 rounded-md transition-colors group relative
            ${isActive ? 'bg-[#161b22] text-[#58a6ff]' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]'}
          `}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
        </NavLink>
        
        <NavLink 
          to="/profile"
          className={({ isActive }) => `
            mt-4 flex items-center p-1 rounded-lg transition-all
            ${isActive ? 'bg-[#161b22] ring-1 ring-[#58a6ff]' : 'hover:bg-[#161b22]'}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-[#30363d] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-[#8b949e]" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-xs font-bold text-white truncate">Administrator</div>
              <div className="text-[10px] text-[#8b949e] truncate leading-tight">SOC Analyst Level 3</div>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#58a6ff] transition-all"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
