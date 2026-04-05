import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import type { IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import useAppStore from '../store/useAppStore'

export default function useWebSocket() {
  const clientRef = useRef<Client | null>(null)
  const addMessage = useAppStore((state) => state.addMessage)

  const handleSingleResult = (body: string) => {
    if (body.startsWith('ROUTE:')) {
      const parts = body.split(':')
      const origin = parts[1]
      const destination = parts[2]
      const distance = parts[3]
      const duration = parts[4]
      const coordinates = JSON.parse(parts[5])

      useAppStore.getState().setMapData({
        origin, destination, distance, duration, coordinates
      })

      addMessage({
        type: 'ai',
        text: `Route from ${origin} to ${destination} | ${distance}km | ${duration} mins`
      })

    } else if (body.startsWith('STOPS:')) {
      const stopsData = body.replace('STOPS:', '')
      const stops = stopsData.split('|').map((stop: string) => {
        const parts = stop.split(',')
        return {
          name: parts[0],
          lat: parseFloat(parts[1]),
          lng: parseFloat(parts[2])
        }
      })

      useAppStore.getState().setStops(stops)

      const stopNames = stops.map((s: { name: string }) => s.name).join(', ')
      addMessage({
        type: 'ai',
        text: `Found ${stops.length} stops: ${stopNames}`
      })

    } else if (!body.includes('Processing')) {
      addMessage({
        type: 'ai',
        text: body
      })
    }
  }

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL}/ws`),
      onConnect: () => {
        console.log('WebSocket connected!')

        client.subscribe('/topic/route-updates', (message: IMessage) => {
          const isStatus = message.body.includes('Processing')

          if (isStatus) {
            addMessage({ type: 'status', text: message.body })
            return
          }

          // Handle multiple results joined by ||
          if (message.body.includes('||')) {
            message.body.split('||').forEach(part => handleSingleResult(part.trim()))
            return
          }

          handleSingleResult(message.body)
        })
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
      reconnectDelay: 5000,
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [])

  const sendMessage = (message: string): void => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/plan-route',
        body: message
      })
    }
  }

  return { sendMessage }
}