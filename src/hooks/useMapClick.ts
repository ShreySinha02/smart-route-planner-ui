import { useMapEvents } from 'react-leaflet'
import type { Location } from '../store/useAppStore'

interface Props {
  onLocationSelect: (location: Location) => void
}

export default function MapClickHandler({ onLocationSelect }: Props) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect({ lat, lng })
    }
  })

  return null
}