import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStockQuote, searchStocks } from './stockApi'

// Mock global fetch
global.fetch = vi.fn()

describe('stockApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStockQuote', () => {
    it('successfully fetches and formats stock data', async () => {
      const mockResponse = {
        c: 2500.5,
        h: 2550.0,
        l: 2480.0,
        o: 2490.0,
        pc: 2485.0,
        d: 15.5,
        dp: 0.62
      }

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      })

      const result = await getStockQuote('RELIANCE.NS')

      expect(result).toEqual({
        current: 2500.5,
        high: 2550.0,
        low: 2480.0,
        open: 2490.0,
        prevClose: 2485.0,
        change: 15.5,
        percentChange: 0.62,
        symbol: 'RELIANCE.NS'
      })
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('returns null on fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
      
      const result = await getStockQuote('RELIANCE.NS')
      expect(result).toBeNull()
    })
  })

  describe('searchStocks', () => {
    it('returns search results from Finnhub', async () => {
      const mockResult = [
        { description: 'RELIANCE INDS', symbol: 'RELIANCE.NS' },
        { description: 'RELIANCE INFRA', symbol: 'RELINFRA.NS' }
      ]

      fetch.mockResolvedValueOnce({
        json: async () => ({ result: mockResult })
      })

      const results = await searchStocks('Reliance')

      expect(results).toHaveLength(2)
      expect(results[0].symbol).toBe('RELIANCE.NS')
    })

    it('returns empty array on error', async () => {
      fetch.mockRejectedValueOnce(new Error('API Down'))
      const results = await searchStocks('Reliance')
      expect(results).toEqual([])
    })
  })
})
