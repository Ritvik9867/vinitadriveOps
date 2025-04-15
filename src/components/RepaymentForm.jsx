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

function RepaymentForm({ onSubmit, pendingAmount = 0 }) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'ONLINE',
    description: '',
    screenshot: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.amount) {
        throw new Error('Please enter repayment amount')
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      if (amount > pendingAmount) {
        throw new Error(`Amount exceeds pending amount of ₹${pendingAmount.toLocaleString()}`)
      }

      if (!formData.screenshot) {
        throw new Error('Payment screenshot is mandatory')
      }

      // Submit the form
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      })
      
      // Reset form on success
      setFormData({
        amount: '',
        paymentMode: 'ONLINE',
        description: '',
        screenshot: null,
      })
      setSuccess('Repayment submitted successfully. Pending admin approval.')
    } catch (error) {
      setError(error.message || 'Failed to submit repayment')
    } finally {
      setIsSubmitting(false)
    }
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