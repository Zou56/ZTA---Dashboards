import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Terminal, X, XCircle } from 'lucide-react'

const themeMap = {
  success: {
    container: 'border-emerald-100 bg-emerald-50/90 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-100',
    iconBg: 'bg-white dark:bg-emerald-800 text-emerald-500 border-emerald-100 dark:border-emerald-700',
    icon: <CheckCircle className="w-4 h-4" />
  },
  error: {
    container: 'border-rose-100 bg-rose-50/90 text-rose-800 dark:bg-rose-900/90 dark:border-rose-800 dark:text-rose-100',
    iconBg: 'bg-white dark:bg-rose-800 text-rose-500 border-rose-100 dark:border-rose-700',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  info: {
    container: 'border-blue-100 bg-blue-50/90 text-blue-800 dark:bg-blue-900/90 dark:border-blue-800 dark:text-blue-100',
    iconBg: 'bg-white dark:bg-blue-800 text-blue-500 border-blue-100 dark:border-blue-700',
    icon: <Terminal className="w-4 h-4" />
  }
}

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const toast = useCallback((message, type = 'info') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Overlay */}
      <div className="fixed top-24 right-8 space-y-3 z-[1000] max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-4 p-4 rounded-2xl shadow-premium border backdrop-blur-xl animate-px-fade pointer-events-auto transition-all duration-300
            ${themeMap[t.type].container}`}>
            <div className={`p-2 rounded-xl border ${themeMap[t.type].iconBg}`}>
               {themeMap[t.type].icon}
            </div>
            <div className="flex-1 mt-0.5">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1.5">{t.type}</p>
               <p className="text-sm font-bold tracking-tight">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
               <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
