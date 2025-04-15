import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
} from '@mui/material'
import { Camera } from '@capacitor/camera'

function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
      })
      setFormData(prev => ({
        ...prev,
        image: image.base64String
      }))
    } catch (error) {
      console.error('Camera error:', error)
      setError('Failed to capture image. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'submitComplaint',
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Complaint submitted successfully')
        setFormData({
          title: '',
          description: '',
          image: null,
        })
      } else {
        setError(data.message || 'Failed to submit complaint')
      }
    } catch (err) {
      setError('Failed to submit complaint. Please try again.')
      console.error('Complaint submission error:', err)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Complaint
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="title"
              label="Complaint Title"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={takePicture}
              sx={{ mb: 2 }}
            >
              {formData.image ? 'Retake Picture' : 'Add Picture'}
            </Button>

            {formData.image && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={`data:image/jpeg;base64,${formData.image}`}
                  alt="Complaint"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Submit Complaint
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ComplaintForm