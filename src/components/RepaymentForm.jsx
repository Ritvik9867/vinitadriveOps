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

function RepaymentForm() {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    screenshot: null,
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

  const takeScreenshot = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
      })
      setFormData(prev => ({
        ...prev,
        screenshot: image.base64String
      }))
    } catch (error) {
      console.error('Camera error:', error)
      setError('Failed to capture screenshot. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.amount) {
      setError('Please enter repayment amount')
      return
    }

    if (!formData.screenshot) {
      setError('Please add payment screenshot')
      return
    }

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxhD-Ks6KXGjSG_FkQGQGGFgxzOeqOF_1Z3BYyglDcRW_-rH2M/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'submitRepayment',
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Repayment submitted successfully. Pending admin approval.')
        setFormData({
          amount: '',
          description: '',
          screenshot: null,
        })
      } else {
        setError(data.message || 'Failed to submit repayment')
      }
    } catch (err) {
      setError('Failed to submit repayment. Please try again.')
      console.error('Repayment submission error:', err)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Repayment
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
              name="amount"
              label="Repayment Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={takeScreenshot}
              sx={{ mb: 2 }}
            >
              {formData.screenshot ? 'Retake Screenshot' : 'Add Payment Screenshot'}
            </Button>

            {formData.screenshot && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={`data:image/jpeg;base64,${formData.screenshot}`}
                  alt="Payment Screenshot"
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
              Submit Repayment
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default RepaymentForm