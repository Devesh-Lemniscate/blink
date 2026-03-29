import React, { useState } from 'react'
import { createShortUrl } from '../api/shortUrl.api'
import { useSelector } from 'react-redux'
import { queryClient } from '../main'

const UrlForm = () => {
  
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [customSlug, setCustomSlug] = useState("")
  const {isAuthenticated} = useSelector((state) => state.auth)

  const handleSubmit = async () => {
    if (!url) return
    setLoading(true)
    try {
      const shortUrl = await createShortUrl(url, customSlug)
      setShortUrl(shortUrl)
      queryClient.invalidateQueries({queryKey: ['userUrls']})
      setError(null)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Main input row */}
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your link here"
          className="flex-1 px-4 py-3 bg-[#111] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url}
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Creating...' : 'Shorten'}
        </button>
      </div>

      {/* Custom slug for authenticated users */}
      {isAuthenticated && (
        <input
          type="text"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          placeholder="Custom slug (optional)"
          className="w-full px-4 py-3 bg-[#111] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors text-sm"
        />
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {shortUrl && (
        <div className="flex gap-3 p-4 bg-[#111] border border-white/[0.08] rounded-lg">
          <input
            type="text"
            readOnly
            value={shortUrl}
            className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              copied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

export default UrlForm