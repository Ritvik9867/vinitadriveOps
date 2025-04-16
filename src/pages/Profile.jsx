import { useState, useEffect } from 'react'
import { Camera } from '@capacitor/camera'
import { API_BASE_URL, getAuthHeaders } from '../config/api'
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material'

/**
 * Profile component that displays user information and allows profile image update.
 */
function Profile() {
  const [profileImage, setProfileImage] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'getProfile' })
        })
        const data = await response.json()
        if (data.success) {
          setUserInfo(data.user)
          setProfileImage(data.user.profileImageUrl || null)
        } else {
          setError(data.message || 'Failed to fetch profile')
        }
      } catch (err) {
        setError('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Handle profile image update
  const takePicture = async () => {
    setError('')
    setSuccess('')
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
      })
      setUploading(true)
      // Upload to backend
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'updateProfileImage',
          image: image.base64String,
        })
      })
      const data = await response.json()
      if (data.success) {
        setProfileImage(data.imageUrl)
        setSuccess('Profile image updated successfully!')
      } else {
        setError(data.message || 'Failed to update profile image')
      }
    } catch (err) {
      setError('Failed to update profile image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2, cursor: uploading ? 'not-allowed' : 'pointer' }} onClick={uploading ? undefined : takePicture}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2">Add Photo</Typography>
              </Box>
            )}
            {uploading && <CircularProgress size={24} sx={{ position: 'absolute', top: 50, left: 50 }} />}
          </Box>
          <Typography variant="h6">{userInfo?.name}</Typography>
        </Box>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1"><b>Email:</b> {userInfo?.email}</Typography>
          <Typography variant="body1"><b>Total Drives:</b> {userInfo?.totalDrives}</Typography>
          <Typography variant="body1"><b>Member Since:</b> {userInfo?.joinDate}</Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={takePicture}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Change Profile Photo'}
        </Button>
      </Paper>
    </Box>
  )
}

export default Profile