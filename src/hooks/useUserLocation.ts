import { useEffect } from 'react'
import useAppStore from '../store/useAppStore'

export default function useUserLocation() {
  const setUserLocation = useAppStore((state) => state.setUserLocation)
  const userLocation = useAppStore((state) => state.userLocation)

  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      console.error('Geolocation not supported by this browser')
      return
    }

    // Ask for permission and get location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        console.log('Location found:', position.coords)
      },
      (error) => {
        console.error('Location error:', error.message)
        // Fallback to Bengaluru center if user denies
        setUserLocation({ lat: 12.9716, lng: 77.5946 })
      },
      {
        enableHighAccuracy: true,  // use GPS if available
        timeout: 10000,            // wait max 10 seconds
        maximumAge: 0              // don't use cached location
      }
    )
  }, [])

  return { userLocation }
}