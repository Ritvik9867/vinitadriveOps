import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Camera } from '@capacitor/camera'

import { API_BASE_URL, getAuthHeaders } from '../config/api'

function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    image: null,
    priority: 'MEDIUM',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

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

  // Handles the actual API submission after confirmation
  const submitComplaint = async () => {
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    setShowConfirm(false)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'addComplaint',
          title: formData.title,
          category: formData.category,
          description: formData.description,
          image: formData.image,
          priority: formData.priority,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          title: '',
          category: '',
          description: '',
          image: null,
          priority: 'MEDIUM',
        })
        setSuccess('Complaint submitted successfully')
      } else {
        setError(data.message || 'Failed to submit complaint')
      }
    } catch (error) {
      setError('Failed to submit complaint')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handles form validation and opens confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields')
      return
    }
    setShowConfirm(true)
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Complaint
      </Typography>

      {/* Confirmation Modal */}
      {showConfirm && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Paper sx={{ p: 4, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Confirm Complaint Submission</Typography>
            <Typography sx={{ mb: 2 }}>Are you sure you want to submit this complaint?</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button color="primary" variant="contained" onClick={submitComplaint} disabled={isSubmitting}>
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="title"
              label="Complaint Title"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="VEHICLE">Vehicle Issue</MenuItem>
                <MenuItem value="PAYMENT">Payment Issue</MenuItem>
                <MenuItem value="CUSTOMER">Customer Issue</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
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
              helperText="Please provide detailed information about your complaint"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={takePicture}
              sx={{ mb: 2 }}
            >
              {formData.image ? 'Retake Picture' : 'Add Picture (Optional)'}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                'Submit Complaint'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ComplaintForm