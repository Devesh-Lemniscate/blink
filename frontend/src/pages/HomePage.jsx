
import React from 'react'
import UrlForm from '../components/UrlForm'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
            Short links,<br />big impact.
          </h1>
          <p className="text-white/40 text-lg mb-12 max-w-md mx-auto">
            Create clean, trackable links in seconds.
          </p>
          
          {/* URL Form */}
          <div className="max-w-xl mx-auto">
            <UrlForm />
          </div>
        </div>
      </div>
      
      {/* Simple stats or trust indicators */}
      <div className="border-t border-white/[0.06] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-semibold mb-1">Fast</div>
              <div className="text-sm text-white/40">Instant link creation</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">Simple</div>
              <div className="text-sm text-white/40">No complexity</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">Free</div>
              <div className="text-sm text-white/40">Always will be</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage