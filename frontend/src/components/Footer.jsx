import { Link } from 'react-router-dom'
import { BarChart2 } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyzer', path: '/analyzer' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
  ]

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-6">
          {/* Brand Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">
                Sentiment<span className="text-indigo-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              An NLP text classification project analyzing sentiment on 50,000 IMDB movie reviews using TF-IDF feature extraction and Logistic Regression.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Navigation</h4>
            <ul className="grid grid-cols-2 gap-1.5 text-xs">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Details */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">Academic Project</h4>
            <p className="text-slate-500 leading-relaxed">
              Developed as an undergraduate Computer Science mini-project demonstrating end-to-end Machine Learning and web application development.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} SentimentAI • NLP Sentiment Analysis Mini Project</p>
          <p>Built with React, Vite, Tailwind CSS & FastAPI</p>
        </div>
      </div>
    </footer>
  )
}
