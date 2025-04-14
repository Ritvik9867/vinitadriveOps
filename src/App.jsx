import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SplashScreen } from '@capacitor/splash-screen'
import Layout from './components/Layout'
import Home from './pages/Home'
import Drives from './pages/Drives'
import Profile from './pages/Profile'
import './App.css'

function App() {
  useEffect(() => {
    // Hide the splash screen after the app is ready
    SplashScreen.hide()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="drives" element={<Drives />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App