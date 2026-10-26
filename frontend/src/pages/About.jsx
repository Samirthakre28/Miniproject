import {
  BookOpen,
  Database,
  Cpu,
  Layers,
  Code2,
  Users,
  Search,
  Binary
} from 'lucide-react'

export default function About() {
  const teamMembers = [
    {
      name: 'Student 1',
      role: 'Frontend & UI Integration',
      details: 'Department of Computer Science & Engineering',
    },
    {
      name: 'Student 2',
      role: 'NLP & Preprocessing Pipeline',
      details: 'Department of Computer Science & Engineering',
    },
    {
      name: 'Student 3',
      role: 'Backend API & Model Training',
      details: 'Department of Computer Science & Engineering',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          About SentimentAI
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Academic Project Documentation • Natural Language Processing & Machine Learning
        </p>
      </div>

      {/* 1. Project Overview */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Project Overview</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong>SentimentAI</strong> is an academic undergraduate mini-project designed to demonstrate the practical application of Natural Language Processing (NLP) and supervised Machine Learning for text classification. The system analyzes raw movie review text and classifies it as either favorable (Positive) or unfavorable (Negative), while reporting calibrated model confidence scores.
        </p>
      </section>

      {/* 2. Dataset */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Dataset</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The system is trained and evaluated on the benchmark <strong>IMDB Large Movie Review Dataset</strong>, consisting of 50,000 highly polarized movie reviews. The dataset is balanced with exactly 25,000 positive reviews and 25,000 negative reviews.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 font-semibold block text-[11px]">Total Volume</span>
            <span className="text-sm font-bold text-slate-900 font-mono">50,000 Reviews</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 font-semibold block text-[11px]">Class Balance</span>
            <span className="text-sm font-bold text-slate-900 font-mono">50% Pos / 50% Neg</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 font-semibold block text-[11px]">Partition Split</span>
            <span className="text-sm font-bold text-slate-900 font-mono">80% Train / 20% Test</span>
          </div>
        </div>
      </section>

      {/* 3. NLP Preprocessing */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600" />
          <span>NLP Preprocessing</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Raw movie reviews from IMDB frequently contain HTML line breaks (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">&lt;br /&gt;</code>), non-standard punctuation, URLs, and inconsistent casing. The preprocessing module converts all characters to lowercase, strips HTML tags with regular expressions, eliminates non-alphabetic symbols, and normalizes extraneous whitespace so that linguistic tokens are cleanly prepared for statistical vectorization.
        </p>
      </section>

      {/* 4. TF-IDF */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Binary className="w-4 h-4 text-indigo-600" />
          <span>TF-IDF</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We use <strong>Term Frequency-Inverse Document Frequency (TF-IDF)</strong> to convert unstructured textual tokens into numerical vectors. TF-IDF penalizes frequent but uninformative terms while assigning higher weights to words that discriminate sentiment polarity. The vectorizer extracts up to 10,000 unigram and bigram features, fitted strictly on the 40,000 training samples and applied to inference using <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.transform()</code> to prevent data leakage.
        </p>
      </section>

      {/* 5. Logistic Regression */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Logistic Regression</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The core classification model is <strong>Logistic Regression</strong> with L2 regularization (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">C=1.0</code>) and the <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">lbfgs</code> solver. Logistic Regression provides strong interpretability, rapid inference latency, and well-calibrated class probabilities, achieving an accuracy of <strong>90.42%</strong> on the 10,000 held-out test split.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Accuracy</span>
            <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">90.42%</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Precision</span>
            <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">89.97%</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Recall</span>
            <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">90.98%</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">F1-Score</span>
            <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">90.47%</span>
          </div>
        </div>
      </section>

      {/* 6. Technology Stack */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-600" />
          <span>Technology Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Frontend</span>
            <p className="text-slate-600">React 19, Vite 6, Tailwind CSS, React Router, Recharts, Axios</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Backend</span>
            <p className="text-slate-600">Python 3.14, FastAPI, Uvicorn ASGI server, Pydantic v2, Starlette CORS</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Machine Learning</span>
            <p className="text-slate-600">Scikit-Learn, TF-IDF Vectorizer, Logistic Regression, Joblib Serialization</p>
          </div>
        </div>
      </section>

      {/* 7. Team Members */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Team Members</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-0.5">
              <span className="font-bold text-slate-900 block">{member.name}</span>
              <span className="text-indigo-700 font-semibold block text-[11px]">{member.role}</span>
              <span className="text-slate-500 block text-[10px]">{member.details}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
