import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import ProtectedRoute from './components/ProtectedRoute'
import Display from './pages/Display'
import Staff from './pages/Staff'
import Admin from './pages/Admin'

function App() {
  return (
    <div className="min-h-screen bg-app text-app">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['user','admin','staff']}><Dashboard /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute roles={['user','admin','staff']}><MapPage /></ProtectedRoute>} />
          <Route path="/display" element={<Display />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
