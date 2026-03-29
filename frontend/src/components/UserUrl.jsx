import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllUserUrls } from '../api/user.api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const UserUrl = () => {
  const { data: urls, isLoading, isError, error } = useQuery({
    queryKey: ['userUrls'],
    queryFn: getAllUserUrls,
    refetchInterval: 30000,
    staleTime: 0,
  })
  const [copiedId, setCopiedId] = useState(null)
  
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-white/40 text-sm">
        Loading...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
        Error: {error.message}
      </div>
    )
  }

  if (!urls?.urls || urls.urls.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/40 text-sm">No links yet. Create one above.</p>
      </div>
    )
  }

  const sortedUrls = [...urls.urls].reverse()

  return (
    <div className="space-y-3">
      {sortedUrls.map((url) => (
        <div 
          key={url._id} 
          className="flex items-center justify-between gap-4 p-4 bg-[#111] border border-white/[0.06] rounded-lg group"
        >
          <div className="flex-1 min-w-0">
            <a 
              href={`${API_URL}/${url.short_url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white font-mono text-sm hover:underline"
            >
              {url.short_url}
            </a>
            <p className="text-white/30 text-xs mt-1 truncate">{url.full_url}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm tabular-nums">
              {url.clicks} clicks
            </span>
            <button
              onClick={() => handleCopy(`${API_URL}/${url.short_url}`, url._id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                copiedId === url._id
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {copiedId === url._id ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserUrl
