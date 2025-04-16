import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL, getAuthHeaders } from '../config/api'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Modal,
  Grid,
} from '@mui/material'
import ODImageForm from '../components/ODImageForm'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showODForm, setShowODForm] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isODSubmitting, setIsODSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handles login form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      setIsSubmitting(false)
      return
    }

    try {
      const requestBody = {
        action: 'login',
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        setSuccess('Login successful!')
        if (data.user.role === 'driver' && data.isFirstLoginOfDay) {
          setIsFirstLogin(true)
          setShowODForm(true)
        } else {
          navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/')
        }
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError('Please check your internet connection')
      } else {
        setError('Login failed. Please try again')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handles OD submission after first login
  const handleODSubmit = async (odData) => {
    setIsODSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'submitODReading',
          ...odData,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowODForm(false)
        setSuccess('OD reading submitted successfully!')
        navigate('/')
      } else {
        setError(data.message || 'Failed to submit OD reading')
      }
    } catch (err) {
      setError('Failed to submit OD reading. Please try again.')
    } finally {
      setIsODSubmitting(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Replace with your company logo */}
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            VinitadriveOps
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button
                  onClick={() => navigate('/register')}
                  variant="text"
                  size="small"
                >
                  Don't have an account? Sign up
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      <Modal
        open={showODForm}
        aria-labelledby="od-form-modal"
        aria-describedby="modal-to-submit-od-reading"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ 
          position: 'absolute',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          outline: 'none',
          borderRadius: 2,
        }}>
          <ODImageForm onSubmit={handleODSubmit} isLoading={isODSubmitting} />
        </Box>
      </Modal>
    </Container>
  )
}

export default Login