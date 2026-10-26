import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  Table as TableIcon,
  Cpu,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { getDashboardMetrics } from '../services/api'

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded text-xs shadow border border-slate-800 space-y-0.5">
        <p className="font-semibold text-slate-200">{label}</p>
        <p className="text-indigo-400 font-bold font-mono text-xs sm:text-sm">
          {Number(payload[0].value).toFixed(2)}%
        </p>
        <p className="text-[10px] text-slate-400">10,000 Review Test Evaluation</p>
      </div>
    )
  }
  return null
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded text-xs shadow border border-slate-800 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold text-slate-200">{data.name}</span>
        </div>
        <p className="text-slate-100 font-mono font-bold text-xs sm:text-sm">
          {Number(data.value).toLocaleString()} reviews
        </p>
        <p className="text-[10px] text-slate-400">50.0% of total dataset</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const res = await getDashboardMetrics()
    if (res.success && res.data) {
      setMetrics(res.data)
    } else {
      setError(res.error || 'Failed to load evaluation metrics.')
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const res = await getDashboardMetrics()
      if (!ignore) {
        if (res.success && res.data) {
          setMetrics(res.data)
        } else {
          setError(res.error || 'Failed to load evaluation metrics.')
        }
        setIsLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 py-4 animate-pulse">
        <div className="h-7 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-slate-200 h-64" />
          <div className="bg-white rounded-lg border border-slate-200 h-64" />
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="py-12 max-w-md mx-auto space-y-3.5 text-center">
        <AlertCircle className="w-9 h-9 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Evaluation Metrics Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {error || 'Unable to retrieve evaluation metrics from the FastAPI backend.'}
        </p>
        <button
          type="button"
          onClick={fetchMetrics}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    )
  }

  const { model_performance, dataset, confusion_matrix, class_metrics, model_info } = metrics

  const sentimentDistributionData = [
    { name: 'Positive Reviews', value: dataset.positive, color: '#10b981' },
    { name: 'Negative Reviews', value: dataset.negative, color: '#ef4444' },
  ]

  const performanceMetricsData = [
    { name: 'Accuracy', score: model_performance.accuracy, fill: '#4f46e5' },
    { name: 'Precision', score: model_performance.precision, fill: '#0284c7' },
    { name: 'Recall', score: model_performance.recall, fill: '#7c3aed' },
    { name: 'F1-Score', score: model_performance.f1_score, fill: '#d97706' },
  ]

  const metricCards = [
    {
      label: 'Accuracy',
      value: `${model_performance.accuracy.toFixed(2)}%`,
      detail: '10,000 test reviews',
      icon: CheckCircle2,
      textColor: 'text-indigo-700',
    },
    {
      label: 'Precision',
      value: `${model_performance.precision.toFixed(2)}%`,
      detail: 'Positive class precision',
      icon: Target,
      textColor: 'text-sky-700',
    },
    {
      label: 'Recall',
      value: `${model_performance.recall.toFixed(2)}%`,
      detail: 'True positive rate',
      icon: Activity,
      textColor: 'text-violet-700',
    },
    {
      label: 'F1-Score',
      value: `${model_performance.f1_score.toFixed(2)}%`,
      detail: 'Harmonic mean',
      icon: Award,
      textColor: 'text-amber-700',
    },
  ]

  const totalCorrect = confusion_matrix.true_negative + confusion_matrix.true_positive
  const totalTest = dataset.test

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3 sm:pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Model Evaluation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Performance metrics of the TF-IDF + Logistic Regression model evaluated on the 10,000-review test split.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            Test Set: 10,000 Samples
          </span>
          <button
            type="button"
            onClick={fetchMetrics}
            title="Refresh metrics"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Core Model Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-sm space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-mono tracking-tight ${card.textColor}`}>
                {card.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500">{card.detail}</p>
            </div>
          )
        })}
      </div>

      {/* 2. Dataset Overview */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Dataset Distribution & Partition</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">IMDB Large Movie Review Dataset</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Reviews</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">{dataset.total.toLocaleString()}</div>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Positive Class</span>
            <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono">{dataset.positive.toLocaleString()}</div>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Negative Class</span>
            <div className="text-base sm:text-lg font-bold text-rose-700 font-mono">{dataset.negative.toLocaleString()}</div>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Train Set (80%)</span>
            <div className="text-base sm:text-lg font-bold text-indigo-700 font-mono">{dataset.train.toLocaleString()}</div>
          </div>
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Test Set (20%)</span>
            <div className="text-base sm:text-lg font-bold text-indigo-700 font-mono">{dataset.test.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 3. Charts: Dataset Sentiment Distribution & Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              <span>Dataset Class Balance (50:50)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">25k / 25k</span>
          </div>

          <div className="h-56 sm:h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Performance Comparison Bar Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Test Evaluation Metrics</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">10,000 Test Reviews</span>
          </div>

          <div className="h-56 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceMetricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} unit="%" />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={42}>
                  {performanceMetricsData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Confusion Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
              <TableIcon className="w-4 h-4 text-indigo-600" />
              <span>Confusion Matrix (10,000 Test Reviews)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Ground-truth labels vs. Logistic Regression model predictions.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 self-start sm:self-auto font-mono">
            {totalCorrect.toLocaleString()} / {totalTest.toLocaleString()} Correct ({model_performance.accuracy.toFixed(2)}%)
          </span>
        </div>

        {/* Mobile View: 2x2 Clean Metric Cards (No Horizontal Scroll) */}
        <div className="grid grid-cols-2 gap-2 sm:hidden text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">True Negative (TN)</span>
            <div className="text-xl font-bold text-emerald-900 font-mono">
              {confusion_matrix.true_negative.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-700">89.86% correct (0 as 0)</p>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">False Positive (FP)</span>
            <div className="text-xl font-bold text-amber-900 font-mono">
              {confusion_matrix.false_positive.toLocaleString()}
            </div>
            <p className="text-[10px] text-amber-700">Type I Error: 10.14%</p>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">False Negative (FN)</span>
            <div className="text-xl font-bold text-rose-900 font-mono">
              {confusion_matrix.false_negative.toLocaleString()}
            </div>
            <p className="text-[10px] text-rose-700">Type II Error: 9.02%</p>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">True Positive (TP)</span>
            <div className="text-xl font-bold text-emerald-900 font-mono">
              {confusion_matrix.true_positive.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-700">90.98% correct (1 as 1)</p>
          </div>
        </div>

        {/* Tablet & Desktop View: Traditional Matrix Grid */}
        <div className="hidden sm:block">
          <div className="max-w-xl mx-auto space-y-2">
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div />
              <div className="font-semibold text-slate-700 py-1.5 bg-slate-100 rounded">
                Predicted Negative (0)
              </div>
              <div className="font-semibold text-slate-700 py-1.5 bg-slate-100 rounded">
                Predicted Positive (1)
              </div>
            </div>

            {/* Row 1: Actual Negative */}
            <div className="grid grid-cols-3 gap-2 items-stretch">
              <div className="font-semibold text-slate-700 text-xs flex items-center justify-center p-2 bg-slate-100 rounded text-center">
                Actual Negative (5,000)
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">True Negative (TN)</span>
                <div className="text-2xl font-bold text-emerald-900 font-mono">
                  {confusion_matrix.true_negative.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-700">89.86% correct</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">False Positive (FP)</span>
                <div className="text-2xl font-bold text-amber-900 font-mono">
                  {confusion_matrix.false_positive.toLocaleString()}
                </div>
                <p className="text-[11px] text-amber-700">Type I Error (10.14%)</p>
              </div>
            </div>

            {/* Row 2: Actual Positive */}
            <div className="grid grid-cols-3 gap-2 items-stretch">
              <div className="font-semibold text-slate-700 text-xs flex items-center justify-center p-2 bg-slate-100 rounded text-center">
                Actual Positive (5,000)
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">False Negative (FN)</span>
                <div className="text-2xl font-bold text-rose-900 font-mono">
                  {confusion_matrix.false_negative.toLocaleString()}
                </div>
                <p className="text-[11px] text-rose-700">Type II Error (9.02%)</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">True Positive (TP)</span>
                <div className="text-2xl font-bold text-emerald-900 font-mono">
                  {confusion_matrix.true_positive.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-700">90.98% correct</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Class Metrics & Hyperparameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Class Metrics */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3.5">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-100 pb-2">
            Per-Class Classification Metrics
          </h3>
          <div className="space-y-3 text-xs">
            {/* Negative Class */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Negative Class (Label 0)</span>
                <span className="font-mono text-slate-500">Support: {class_metrics.negative.support}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Precision</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.negative.precision.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recall</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.negative.recall.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">F1-Score</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.negative.f1_score.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Positive Class */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Positive Class (Label 1)</span>
                <span className="font-mono text-slate-500">Support: {class_metrics.positive.support}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Precision</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.positive.precision.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recall</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.positive.recall.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">F1-Score</span>
                  <span className="font-bold font-mono text-slate-800">{class_metrics.positive.f1_score.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Hyperparameters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3.5">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Trained Pipeline Configuration</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Algorithm</span>
              <span className="font-bold text-slate-900">{model_info.algorithm}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Feature Extraction</span>
              <span className="font-bold text-slate-900">{model_info.feature_extraction}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">N-Grams</span>
              <span className="font-bold text-slate-900">{model_info.n_grams}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Max Features</span>
              <span className="font-bold text-slate-900 font-mono">{model_info.max_features.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Solver</span>
              <span className="font-bold text-slate-900 font-mono">{model_info.solver}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Regularization (C)</span>
              <span className="font-bold text-slate-900 font-mono">{model_info.c_parameter}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link to Analyzer */}
      <div className="p-4 sm:p-5 rounded-lg bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 block text-xs sm:text-sm">Test live reviews in the Sentiment Analyzer</span>
          <span className="text-slate-600">Enter custom review text to evaluate model predictions in real time.</span>
        </div>
        <Link
          to="/analyzer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors whitespace-nowrap text-center"
        >
          <span>Open Analyzer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
