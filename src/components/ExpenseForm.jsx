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
} from '@mui/material'
import { Camera } from '@capacitor/camera'

function ExpenseForm() {
  const [formData, setFormData] = useState({
    type: 'cng',
    amount: '',
    paymentMode: 'cash',
    receiptImage: null,
    description: '',
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
        receiptImage: image.base64String
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

    if (!formData.amount) {
      setError('Please enter amount')
      return
    }

    if (formData.type === 'cng' && !formData.receiptImage) {
      setError('Please take a picture of the receipt')
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
          action: 'addExpense',
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Expense added successfully')
        setFormData({
          type: 'cng',
          amount: '',
          paymentMode: 'cash',
          receiptImage: null,
          description: '',
        })
      } else {
        setError(data.message || 'Failed to add expense')
      }
    } catch (err) {
      setError('Failed to add expense. Please try again.')
      console.error('Expense submission error:', err)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Expense
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Expense Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Expense Type"
                onChange={handleChange}
              >
                <MenuItem value="cng">CNG</MenuItem>
                <MenuItem value="toll">Toll</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="paymentMode"
                value={formData.paymentMode}
                label="Payment Mode"
                onChange={handleChange}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
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

          {formData.type === 'cng' && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={takePicture}
                sx={{ mb: 2 }}
              >
                {formData.receiptImage ? 'Retake Receipt Picture' : 'Take Receipt Picture'}
              </Button>

              {formData.receiptImage && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={`data:image/jpeg;base64,${formData.receiptImage}`}
                    alt="Receipt"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                  />
                </Box>
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Submit Expense
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ExpenseForm