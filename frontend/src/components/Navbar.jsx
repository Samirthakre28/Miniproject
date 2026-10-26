import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BarChart2, Activity, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { checkBackendHealth } from '../services/api'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking') // checking, online, offline

  useEffect(() => {
    let mounted = true
    const checkStatus = async () => {
      const res = await checkBackendHealth()
      if (mounted) {
        setBackendStatus(res.success ? 'online' : 'offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyzer', path: '/analyzer' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                Sentiment<span className="text-indigo-600">AI</span>
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                NLP Project
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Status Indicator & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title="FastAPI Backend Health"
            >
              {backendStatus === 'online' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>API Online</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>API Offline</span>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Checking...</span>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-3.5 pt-2 pb-3.5 space-y-1 shadow-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <div
              className={`flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span>Backend status:</span>
              <strong className="uppercase">{backendStatus}</strong>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
