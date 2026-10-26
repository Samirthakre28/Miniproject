import { useState } from 'react'
import {
  FileText,
  RotateCcw,
  Send,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { predictSentiment } from '../services/api'

export default function SentimentAnalyzer() {
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  // Realistic movie review examples
  const exampleReviews = [
    {
      label: 'Positive Review Example',
      text: 'Christopher Nolan delivers a compelling cinematic experience with incredible cinematography, visceral audio design, and nuanced acting from the entire cast.',
    },
    {
      label: 'Negative Review Example',
      text: 'The movie suffers from terrible pacing, disjointed editing, and a completely predictable script that fails to engage the audience.',
    },
    {
      label: 'Mixed / Nuanced Example',
      text: 'While the lead performance was outstanding and the visuals were captivating, the third act dragged on unnecessarily and left several major plot holes unresolved.',
    },
  ]

  const charCount = reviewText.length
  const wordCount = reviewText.trim() === '' ? 0 : reviewText.trim().split(/\s+/).length

  const handleClear = () => {
    setReviewText('')
    setError(null)
    setResult(null)
  }

  const handleSelectExample = (text) => {
    setReviewText(text)
    setError(null)
    setResult(null)
  }

  const handleAnalyzeClick = async () => {
    const trimmed = reviewText.trim()
    if (!trimmed) {
      setError('Please enter a movie review before analyzing.')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await predictSentiment(trimmed)
      if (response.success && response.data) {
        setResult({
          sentiment: response.data.sentiment,
          confidence: response.data.confidence,
          text: trimmed,
        })
      } else {
        setError(response.error || 'Failed to analyze review sentiment.')
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred during analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  const isPositive = result?.sentiment?.toLowerCase() === 'positive'

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* Page Title & Instructions */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Movie Review Sentiment Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Enter a movie review below to evaluate sentiment polarity (Positive or Negative) and model confidence using the trained Logistic Regression and TF-IDF pipeline.
        </p>
      </div>

      {/* Main Review Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
        {/* Textarea Header: Label + Character/Word Counter */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label htmlFor="movie-review" className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Review Input</span>
            </label>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-mono">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <textarea
            id="movie-review"
            rows={5}
            value={reviewText}
            disabled={isLoading}
            onChange={(e) => {
              setReviewText(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Type or paste a movie review here (e.g., 'The storyline was engaging and the acting was top notch...')..."
            className="w-full rounded-lg border border-slate-300 p-3 sm:p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-y disabled:bg-slate-50 disabled:text-slate-500 font-sans leading-relaxed"
          />
        </div>

        {/* Example Review Suggestion Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Load a sample movie review:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {exampleReviews.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectExample(item.text)}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="font-semibold text-indigo-700 block text-[11px] mb-0.5">
                  {item.label}
                </span>
                <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                  &ldquo;{item.text}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 sm:p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-900 animate-fadeIn text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-semibold text-rose-800">
                Analysis Request Failed
              </strong>
              <p className="text-rose-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons: Responsive Full-Width on Mobile, Inline on Desktop */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            disabled={(!reviewText && !result && !error) || isLoading}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors w-full sm:w-auto ${
              (reviewText || result || error) && !isLoading
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            id="analyze-sentiment-btn"
            onClick={handleAnalyzeClick}
            disabled={!reviewText.trim() || isLoading}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto ${
              reviewText.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Classifying...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Sentiment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Card Area */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">
            Classification Result
          </h2>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Logistic Regression • 90.42% Acc
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-600 font-medium">
              Executing text preprocessing and TF-IDF feature extraction...
            </p>
          </div>
        )}

        {/* Active Result State */}
        {!isLoading && result && (
          <div className="space-y-3.5 animate-fadeIn">
            <div
              className={`p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isPositive
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPositive ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isPositive ? (
                    <ThumbsUp className="w-5 h-5" />
                  ) : (
                    <ThumbsDown className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Predicted Polarity
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold capitalize text-slate-900">
                    {result.sentiment} Review
                  </h3>
                </div>
              </div>

              {/* Confidence Badge & Progress */}
              <div className="bg-white border border-slate-200 p-2.5 sm:p-3 rounded-lg flex flex-col sm:items-end gap-1 min-w-[130px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Model Confidence
                </span>
                <span
                  className={`text-lg sm:text-xl font-bold font-mono ${
                    isPositive ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {result.confidence.toFixed(2)}%
                </span>
                <div className="w-full sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(result.confidence, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Input Review Preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Evaluated Review Text:
              </span>
              <p className="text-slate-700 italic line-clamp-3 leading-relaxed">
                &ldquo;{result.text}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && (
          <div className="py-6 sm:py-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">No review analyzed yet</p>
            <p>Type or paste a movie review above and click &ldquo;Analyze Sentiment&rdquo; to test model inference.</p>
          </div>
        )}

        {/* Pipeline Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="p-2 sm:p-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Classifier</span>
            <span className="font-medium text-slate-800">Logistic Regression</span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vectorizer</span>
            <span className="font-medium text-slate-800">TF-IDF (10,000 features)</span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Benchmark</span>
            <span className="font-medium text-slate-800">IMDB 50K Dataset</span>
          </div>
        </div>
      </div>
    </div>
  )
}
