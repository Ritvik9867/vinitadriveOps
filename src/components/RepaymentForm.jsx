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

function RepaymentForm({ pendingAmount = 0 }) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'ONLINE',
    description: '',
    screenshot: null,
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

    // Reset error when amount changes
    if (name === 'amount') {
      const amount = parseFloat(value)
      if (amount > pendingAmount) {
        setError(`Amount exceeds pending amount of ₹${pendingAmount.toLocaleString()}`)
      } else {
        setError('')
      }
    }
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

  // Handles the actual API submission after confirmation
  const submitRepayment = async () => {
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    setShowConfirm(false)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'addRepayment',
          amount: parseFloat(formData.amount),
          paymentMode: formData.paymentMode,
          description: formData.description,
          image: formData.screenshot,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          amount: '',
          paymentMode: 'ONLINE',
          description: '',
          screenshot: null,
        })
        setSuccess('Repayment submitted successfully. Pending admin approval.')
      } else {
        setError(data.message || 'Failed to submit repayment')
      }
    } catch (error) {
      setError('Failed to submit repayment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handles form validation and opens confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    // Validate required fields
    if (!formData.amount) {
      setError('Please enter repayment amount')
      return
    }
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    if (amount > pendingAmount) {
      setError(`Amount exceeds pending amount of ₹${pendingAmount.toLocaleString()}`)
      return
    }
    if (!formData.screenshot) {
      setError('Payment screenshot is mandatory')
      return
    }
    setShowConfirm(true)
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit Repayment
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Pending Amount: ₹{pendingAmount.toLocaleString()}
        </Alert>

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

        {/* Confirmation Modal */}
        {showConfirm && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <Paper sx={{ p: 4, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>Confirm Repayment Submission</Typography>
              <Typography sx={{ mb: 2 }}>Are you sure you want to submit this repayment?</Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button color="primary" variant="contained" onClick={submitRepayment} disabled={isSubmitting}>
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="amount"
                label="Repayment Amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!error && error.includes('amount')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  label="Payment Mode"
                  onChange={handleChange}
                >
                  <MenuItem value="ONLINE">Online Transfer</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description (Optional)"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange}
                helperText="Add any relevant details about the payment"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={takeScreenshot}
                sx={{ mb: 2 }}
              >
                {formData.screenshot ? 'Retake Payment Screenshot' : 'Add Payment Screenshot'}
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
                disabled={isSubmitting || !!error}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Submitting Repayment...
                  </>
                ) : (
                  'Submit Repayment'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default RepaymentForm