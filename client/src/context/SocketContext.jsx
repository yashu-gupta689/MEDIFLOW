import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketCtx = createContext(null)

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const url = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '')
    const socket = io(url, { transports: ['websocket'], reconnection: true })
    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <SocketCtx.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketCtx.Provider>
  )
}

export const useSocket = () => useContext(SocketCtx)
