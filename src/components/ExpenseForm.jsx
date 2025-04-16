import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material'
import { Camera } from '@capacitor/camera'

import { API_BASE_URL, getAuthHeaders } from '../config/api'

function ExpenseForm({ currentCashBalance = 0 }) {
  const [formData, setFormData] = useState({
    type: 'CNG',
    amount: '',
    paymentMode: 'CASH',
    receiptImage: null,
    description: ''
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

    // Reset error when payment mode changes
    if (name === 'paymentMode') {
      setError('')
    }

    // Validate cash payment against available balance
    if (name === 'amount' && formData.paymentMode === 'CASH') {
      const amount = parseFloat(value)
      if (amount > currentCashBalance) {
        setError(`Amount exceeds available cash balance of ₹${currentCashBalance.toLocaleString()}`)
      } else {
        setError('')
      }
    }
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
        receiptImage: image.base64String
      }))
    } catch (error) {
      console.error('Camera error:', error)
      setError('Failed to capture image. Please try again.')
    }
  }

  // Handles the actual API submission after confirmation
  const submitExpense = async () => {
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    setShowConfirm(false)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'addExpense',
          type: formData.type,
          amount: parseFloat(formData.amount),
          paymentMode: formData.paymentMode,
          image: formData.receiptImage,
          description: formData.description,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          type: 'CNG',
          amount: '',
          paymentMode: 'CASH',
          receiptImage: null,
          description: ''
        })
        setSuccess('Expense recorded successfully')
      } else {
        setError(data.message || 'Failed to record expense')
      }
    } catch (error) {
      setError('Failed to record expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handles form validation and opens confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.amount) {
      setError('Please enter expense amount')
      return
    }
    if (!formData.receiptImage) {
      setError('Receipt image is mandatory')
      return
    }
    if (formData.paymentMode === 'CASH') {
      const amount = parseFloat(formData.amount)
      if (amount > currentCashBalance) {
        setError(`Amount exceeds available cash balance of ₹${currentCashBalance.toLocaleString()}`)
        return
      }
    }
    setShowConfirm(true)
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Record Expense
        </Typography>

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
              <Typography variant="h6" gutterBottom>Confirm Expense Submission</Typography>
              <Typography sx={{ mb: 2 }}>Are you sure you want to submit this expense?</Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button color="primary" variant="contained" onClick={submitExpense} disabled={isSubmitting}>
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Expense Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Expense Type"
                  onChange={handleChange}
                >
                  <MenuItem value="CNG">CNG</MenuItem>
                  <MenuItem value="TOLL">Toll</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  label="Payment Mode"
                >
                  <MenuItem value="CASH">Cash (Available: ₹{currentCashBalance.toLocaleString()})</MenuItem>
                  <MenuItem value="ONLINE">Online Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={takePicture}
                sx={{ mt: 1 }}
              >
                {formData.receiptImage ? 'Retake Receipt Photo' : 'Take Receipt Photo'}
              </Button>
            </Grid>

            {formData.receiptImage && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={`data:image/jpeg;base64,${formData.receiptImage}`}
                    alt="Receipt"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !!error}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Recording Expense...
                  </>
                ) : (
                  'Record Expense'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default ExpenseForm