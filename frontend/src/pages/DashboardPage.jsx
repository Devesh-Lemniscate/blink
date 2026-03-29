import React, { useState } from 'react'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import { useSelector } from 'react-redux'

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('links')

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            {user?.name ? `${user.name.split(' ')[0]}'s Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-white/40 text-sm">Create and manage your shortened URLs.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              activeTab === 'links'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Links
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              activeTab === 'analytics'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'links' ? (
          <>
            {/* Create Link */}
            <div className="mb-10">
              <UrlForm />
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] mb-8"></div>

            {/* Links */}
            <UserUrl />
          </>
        ) : (
          <AnalyticsDashboard />
        )}
      </div>
    </div>
  )
}

export default DashboardPage