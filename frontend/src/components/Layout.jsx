import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
