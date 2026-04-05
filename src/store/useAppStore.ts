import { create } from 'zustand'

interface Message {
  type: 'user' | 'ai' | 'status'
  text: string
}

interface MapData {
  origin: string
  destination: string
  distance?: string
  duration?: string
  coordinates?: number[][]
}

interface Location {
  lat: number
  lng: number
}

interface Stop {
  name: string
  lat: number
  lng: number
}

interface AppState {
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void

  mapData: MapData | null
  setMapData: (data: MapData) => void

  userLocation: Location | null
  setUserLocation: (location: Location) => void

  destination: Location | null
  setDestination: (location: Location) => void

  // WebSocket sender
  sendMessage: ((msg: string) => void) | null
  setSendMessage: (fn: (msg: string) => void) => void

  stops: Stop[]
  setStops: (stops: Stop[]) => void
}

const useAppStore = create<AppState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),
  clearMessages: () => set({ messages: [] }),

  mapData: null,
  setMapData: (data) => set({ mapData: data }),

  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  destination: null,
  setDestination: (location) => set({ destination: location }),

  sendMessage: null,
  setSendMessage: (fn) => set({ sendMessage: fn }),

  stops: [],
  setStops: (stops) => set({ stops }),
}))

export default useAppStore
export type { Message, MapData, Location,Stop }