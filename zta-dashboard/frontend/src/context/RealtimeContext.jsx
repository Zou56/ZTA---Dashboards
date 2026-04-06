import { createContext, useContext, useEffect, useState, useRef } from 'react'

const RealtimeContext = createContext(null)

export const useRealtime = () => useContext(RealtimeContext)

export function RealtimeProvider({ children }) {
  const [lastEvent, setLastEvent] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef(null)

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8000/ws')
      
      socket.onopen = () => {
        setIsConnected(true)
        console.log('[WS] Connected to ZTA Real-time Engine')
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastEvent(data)
        } catch (err) {
          console.error('[WS] Parse Error:', err)
        }
      }

      socket.onclose = () => {
        setIsConnected(false)
        console.log('[WS] Disconnected. Retrying in 3s...')
        setTimeout(connect, 3000)
      }

      ws.current = socket
    }

    connect()
    return () => ws.current?.close()
  }, [])

  return (
    <RealtimeContext.Provider value={{ lastEvent, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}
