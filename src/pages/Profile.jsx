import { useState } from 'react'
import { Camera } from '@capacitor/camera'

function Profile() {
  const [profileImage, setProfileImage] = useState(null)
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    totalDrives: 150,
    joinDate: '2023-01-15'
  })

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'uri'
      })
      setProfileImage(image.webPath)
    } catch (error) {
      console.error('Camera error:', error)
    }
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-image" onClick={takePicture}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <div className="profile-placeholder">Add Photo</div>
          )}
        </div>
        <h2>{userInfo.name}</h2>
      </div>
      
      <div className="profile-info">
        <div className="info-item">
          <label>Email</label>
          <p>{userInfo.email}</p>
        </div>
        <div className="info-item">
          <label>Total Drives</label>
          <p>{userInfo.totalDrives}</p>
        </div>
        <div className="info-item">
          <label>Member Since</label>
          <p>{userInfo.joinDate}</p>
        </div>
      </div>
    </div>
  )
}

export default Profile