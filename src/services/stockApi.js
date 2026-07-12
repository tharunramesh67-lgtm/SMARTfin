const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY

// Simple in-memory cache to reduce network pressure and stay within rate limits
const cache = {
  quotes: new Map(),
  search: new Map(),
  metrics: new Map(),
  news: new Map()
}

const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

const getCached = (type, key) => {
  const entry = cache[type].get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
    return entry.data
  }
  return null
}

const setCache = (type, key, data) => {
  cache[type].set(key, { data, timestamp: Date.now() })
}

/**
 * Fetches real-time price for a given ticker.
 * For NSE stocks, use SYMBOL.NS (e.g., RELIANCE.NS)
 */
export const getStockQuote = async (symbol, forceRefresh = false) => {
  if (!FINNHUB_KEY) {
    console.warn('Finnhub API key missing.')
    return null
  }

  if (!forceRefresh) {
    const cached = getCached('quotes', symbol)
    if (cached) return cached
  }

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    )
    
    if (response.status === 429) {
      console.warn('Finnhub rate limit reached. Using cached data if available.')
      return getCached('quotes', symbol)
    }

    const data = await response.json()
    
    if (data.error) throw new Error(data.error)
    
    const result = {
      current: data.c,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
      change: data.d,
      percentChange: data.dp,
      symbol
    }

    setCache('quotes', symbol, result)
    return result
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message)
    return getCached('quotes', symbol) || null
  }
}

/**
 * Search for stock symbols.
 */
export const searchStocks = async (query) => {
  if (!FINNHUB_KEY || !query) return []

  const cached = getCached('search', query)
  if (cached) return cached

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${query}&token=${FINNHUB_KEY}`
    )
    const data = await response.json()
    const results = data.result || []
    
    setCache('search', query, results)
    return results
  } catch (error) {
    console.error(`Error searching stocks for ${query}:`, error.message)
    return []
  }
}

/**
 * Get basic financial data.
 */
export const getStockMetrics = async (symbol) => {
  if (!FINNHUB_KEY) return null

  const cached = getCached('metrics', symbol)
  if (cached) return cached

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`
    )
    const data = await response.json()
    setCache('metrics', symbol, data.metric)
    return data.metric
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error.message)
    return null
  }
}

/**
 * Get market news.
 */
export const getMarketNews = async (category = 'general') => {
  if (!FINNHUB_KEY) return []
  
  const cached = getCached('news', category)
  if (cached) return cached

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_KEY}`
    )
    const data = await response.json()
    const results = (data || []).slice(0, 10) // Limit to 10 items
    
    // Fallback if data is empty (rate limit or no news)
    if (results.length === 0) return getCached('news', category) || []

    setCache('news', category, results)
    return results
  } catch (error) {
    console.error('Error fetching market news:', error)
    return getCached('news', category) || []
  }
}

