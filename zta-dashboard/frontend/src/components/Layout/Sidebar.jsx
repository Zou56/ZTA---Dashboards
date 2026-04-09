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
  User,
  Zap
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: ShieldAlert,     label: 'Asset Risk', path: '/assets' },
    { icon: BarChart3,       label: 'Analytics',  path: '/analytics' },
    { icon: Database,        label: 'Datasets',   path: '/datasets' },
    { icon: FileText,        label: 'Reports',    path: '/reports' },
  ]

  return (
    <aside className={`h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out flex flex-col z-[100] ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand / Logo Area */}
      <div className="h-20 flex items-center px-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-primary to-phoenix-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-phoenix-primary/20">
          <Zap className="text-white w-6 h-6" fill="currentColor" />
        </div>
        {!isCollapsed && (
          <div className="ml-4">
            <div className="font-extrabold text-readable-base tracking-tight text-phoenix-text-main dark:text-white leading-none">PHOENIX</div>
            <div className="text-[10px] text-phoenix-primary dark:text-phoenix-secondary font-bold tracking-widest mt-1 opacity-80 uppercase">IoT Solutions</div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6 px-3 space-y-1.5 focus:outline-none">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${isActive 
                ? 'bg-phoenix-primary/5 dark:bg-phoenix-primary/20 text-phoenix-primary dark:text-phoenix-secondary font-semibold shadow-sm' 
                : 'text-phoenix-text-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-phoenix-text-main dark:hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-phoenix-primary rounded-r-full" />
                )}
                
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-phoenix-primary dark:text-phoenix-secondary' : 'group-hover:text-phoenix-text-main dark:group-hover:text-white text-phoenix-text-muted dark:text-slate-500'} transition-colors duration-200`} />
                {!isCollapsed && <span className="ml-4 text-readable-sm tracking-tight">{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-slate-900 px-3 py-1.5 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-3 whitespace-nowrap pointer-events-none z-[110] shadow-xl">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-4 bg-slate-50/50 mt-auto border-t border-slate-100">
        <NavLink 
          to="/settings"
          className={({ isActive }) => `
            w-full flex items-center px-4 py-3 rounded-xl transition-all group relative
            ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
          `}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-4 text-sm font-medium">Settings</span>}
        </NavLink>
        
        <NavLink 
          to="/profile"
          className={({ isActive }) => `
            mt-3 flex items-center p-2 rounded-2xl transition-all bg-white dark:bg-slate-800 border border-transparent
            ${isActive ? 'border-blue-100 dark:border-blue-900 shadow-sm' : 'hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'}
          `}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-inner">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none">Admin User</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">IoT Systems Architect</div>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-md z-[110]"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
