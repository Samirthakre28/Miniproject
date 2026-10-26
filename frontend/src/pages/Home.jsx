import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Binary,
  Cpu,
  Search,
  Database,
  Layers,
  Code2
} from 'lucide-react'

export default function Home() {
  const pipelineStages = [
    {
      num: '01',
      title: 'Text Preprocessing',
      desc: 'Cleans raw movie reviews by stripping HTML tags, removing non-alphabetic characters, and converting text to lowercase for consistent tokenization.',
      icon: Search,
    },
    {
      num: '02',
      title: 'TF-IDF Vectorization',
      desc: 'Converts cleaned review text into numerical feature vectors using Term Frequency-Inverse Document Frequency weighting with unigrams and bigrams.',
      icon: Binary,
    },
    {
      num: '03',
      title: 'Logistic Regression Model',
      desc: 'Supervised classification algorithm trained on 40,000 reviews to classify sentiment polarity as positive or negative with calibrated probability scores.',
      icon: Cpu,
    },
  ]

  const projectFacts = [
    { label: 'Dataset', value: 'IMDB 50,000 Reviews', detail: 'Balanced 25k pos / 25k neg' },
    { label: 'Feature Extraction', value: 'TF-IDF Vectorizer', detail: '10,000 n-gram features' },
    { label: 'Classification Model', value: 'Logistic Regression', detail: '90.42% test set accuracy' },
    { label: 'Full-Stack Architecture', value: 'FastAPI + React', detail: 'Python REST API & Vite UI' },
  ]

  return (
    <div className="space-y-8 sm:space-y-10 py-1 sm:py-2">
      {/* Hero Section */}
      <section className="bg-white rounded-lg border border-slate-200 p-5 sm:p-8 md:p-10 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Undergraduate NLP Mini-Project</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            NLP Sentiment Analysis System
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Analyze movie reviews using Natural Language Processing and Machine Learning.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            This project implements an end-to-end sentiment classification pipeline trained on 50,000 IMDB movie reviews. The model uses TF-IDF feature weighting and Logistic Regression to predict sentiment polarity with high accuracy and fast real-time inference.
          </p>
        </div>

        {/* Methodology Flow Banner */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            End-to-End Pipeline:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-800">
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">Text</span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">Preprocessing</span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">TF-IDF</span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">Logistic Regression</span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold">Sentiment</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
          <Link
            to="/analyzer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors text-center"
          >
            <span>Analyze a Review</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors text-center"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>View Evaluation Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Project Facts Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {projectFacts.map((fact, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 space-y-1 shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {fact.label}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 block font-mono">
              {fact.value}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {fact.detail}
            </span>
          </div>
        ))}
      </section>

      {/* Methodology Section */}
      <section className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Pipeline Methodology
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            The mathematical and algorithmic stages used to transform raw review text into classification output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded bg-slate-100 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">
                    {stage.num}
                  </div>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{stage.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Dataset & Evaluation Summary */}
      <section className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Dataset & Partition Summary</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard 80:20 train-test partition of the IMDB large movie review dataset.
            </p>
          </div>
          <Link
            to="/about"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Full Documentation →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Training Set</span>
            <p className="text-sm font-bold text-slate-900 font-mono">40,000 Reviews (80%)</p>
            <p className="text-[11px] text-slate-500">20,000 positive + 20,000 negative samples used to fit TF-IDF and train classifier.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Test Set</span>
            <p className="text-sm font-bold text-slate-900 font-mono">10,000 Reviews (20%)</p>
            <p className="text-[11px] text-slate-500">Held-out unseen reviews evaluating real generalization accuracy without data leakage.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Test Performance</span>
            <p className="text-sm font-bold text-emerald-700 font-mono">90.42% Accuracy</p>
            <p className="text-[11px] text-slate-500">Precision: 89.97% | Recall: 90.98% | F1-Score: 90.47%.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
