import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material'
import { Camera } from '@capacitor/camera'
import { format } from 'date-fns'

import { API_BASE_URL, getAuthHeaders } from '../config/api'

function ODImageForm() {
  const [formData, setFormData] = useState({
    odReading: '',
    image: null,
    timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleODChange = (e) => {
    setFormData(prev => ({
      ...prev,
      odReading: e.target.value
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

  // Handles the actual API submission after confirmation
  const submitODReading = async () => {
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    setShowConfirm(false)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'addODReading',
          odReading: formData.odReading,
          image: formData.image,
          timestamp: new Date().toISOString(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          odReading: '',
          image: null,
          timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        })
        setSuccess('OD reading submitted successfully')
      } else {
        setError(data.message || 'Failed to submit OD reading')
      }
    } catch (err) {
      setError('Failed to submit OD reading. Please try again.')
      console.error('OD submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handles form validation and opens confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.odReading) {
      setError('Please enter OD reading')
      return
    }
    if (!formData.image) {
      setError('Please capture OD meter image')
      return
    }
    setShowConfirm(true)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Daily OD Reading
        </Typography>

        {/* Confirmation Modal */}
        {showConfirm && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <Paper sx={{ p: 4, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>Confirm OD Submission</Typography>
              <Typography sx={{ mb: 2 }}>Are you sure you want to submit this OD reading?</Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button color="primary" variant="contained" onClick={submitODReading} disabled={isSubmitting}>
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
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

          <TextField
            margin="normal"
            required
            fullWidth
            id="odReading"
            label="OD Reading"
            name="odReading"
            type="number"
            value={formData.odReading}
            onChange={handleODChange}
          />

          <Button
            fullWidth
            variant="outlined"
            onClick={takePicture}
            sx={{ mt: 2, mb: 2 }}
          >
            {formData.image ? 'Retake Picture' : 'Take Picture'}
          </Button>

          {formData.image && (
            <Box sx={{ mb: 2 }}>
              <img
                src={`data:image/jpeg;base64,${formData.image}`}
                alt="OD reading"
                style={{ width: '100%', borderRadius: 4 }}
              />
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default ODImageForm