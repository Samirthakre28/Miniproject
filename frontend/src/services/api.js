import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
const formatBaseUrl = (url) => {
  if (!url || !url.trim()) return 'http://127.0.0.1:8000'
  let cleaned = url.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`
  }
  return cleaned
}
const API_BASE_URL = formatBaseUrl(rawBaseUrl)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health')
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cannot connect to backend',
    }
  }
}

/**
 * Send movie review text to real trained sentiment analysis endpoint.
 *
 * @param {string} reviewText - Raw review input string
 * @returns {Promise<{success: boolean, data?: {sentiment: string, confidence: number}, error?: string}>}
 */
export const predictSentiment = async (reviewText) => {
  try {
    const response = await api.post('/api/predict', { review: reviewText })
    return { success: true, data: response.data }
  } catch (error) {
    let errorMessage = 'Failed to analyze sentiment. Please try again.'
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data.detail === 'string') {
        errorMessage = data.detail
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        errorMessage = data.detail[0].msg
        if (errorMessage.startsWith('Value error, ')) {
          errorMessage = errorMessage.replace('Value error, ', '')
        }
      } else if (data.message) {
        errorMessage = data.message
      }
    } else if (error.request) {
      errorMessage = `Backend server is unreachable. Please verify that the API server (${API_BASE_URL}) is online and accepting requests.`
    } else if (error.message) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export const getDashboardMetrics = async () => {
  try {
    const response = await api.get('/api/dashboard')
    return { success: true, data: response.data }
  } catch (error) {
    let errorMessage = 'Failed to load dashboard metrics. Please ensure the backend server is running.'
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data.detail === 'string') {
        errorMessage = data.detail
      } else if (data.message) {
        errorMessage = data.message
      }
    } else if (error.request) {
      errorMessage = `Backend server is unreachable. Please verify that the API server (${API_BASE_URL}) is online and accepting requests.`
    } else if (error.message) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export default api
