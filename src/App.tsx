import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatPanel from './components/ChatPanel'
import MapPanel from './components/MapPanel'
import 'leaflet/dist/leaflet.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-900">

        {/* Left — Chat Panel */}
        <div className="w-96 min-w-96 border-r border-gray-700 flex flex-col">
          <ChatPanel />
        </div>

        {/* Right — Map Panel */}
        <div className="flex-1">
          <MapPanel />
        </div>

      </div>
    </QueryClientProvider>
  )
}