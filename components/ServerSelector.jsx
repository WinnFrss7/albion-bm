// components/ServerSelector.jsx
'use client'
import { useServerStore, SERVERS } from '@/stores/useServerStore'

export default function ServerSelector() {
  const { selectedServer, setSelectedServer } = useServerStore()

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
      <label htmlFor="server-select" className="text-slate-300 text-sm font-medium">
        Server:
      </label>
      <select
        id="server-select"
        value={selectedServer}
        onChange={(e) => setSelectedServer(e.target.value)}
        className="bg-slate-900/80 text-white border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-slate-900 transition-colors"
      >
        {SERVERS.map((server) => (
          <option key={server.value} value={server.value}>
            {server.flag} {server.label}
          </option>
        ))}
      </select>
    </div>
  )
}