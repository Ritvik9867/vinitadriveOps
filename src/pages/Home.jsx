import { useEffect, useState } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'

function Home() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    const permStatus = await LocalNotifications.checkPermissions()
    if (permStatus.display !== 'granted') {
      await LocalNotifications.requestPermissions()
    }
  }

  return (
    <div className="home">
      <h1>Welcome to VinitadriveOps</h1>
      <div className="dashboard">
        <div className="stats-card">
          <h3>Today's Drives</h3>
          <p className="stat">5</p>
        </div>
        <div className="stats-card">
          <h3>Total Distance</h3>
          <p className="stat">120 km</p>
        </div>
      </div>
    </div>
  )
}

export default Home