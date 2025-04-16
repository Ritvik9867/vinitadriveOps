import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL, API_CONFIG } from '../config/api'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
} from '@mui/material'

function Register() {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'driver'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return false
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number')
      return false
    }

    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }

    if (!formData.password) {
      setError('Please enter a password')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setSubmitting(false)
      return
    }

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('All fields are required')
      setSubmitting(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setSubmitting(false)
      return
    }

    // Create form data
    const params = new URLSearchParams()
    params.append('action', 'register')
    params.append('name', formData.name.trim())
    params.append('email', formData.email.toLowerCase().trim())
    params.append('password', formData.password)
    params.append('phone', formData.phone.replace(/\D/g, '')) // Remove non-digits
    params.append('role', formData.role)

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      })

      // With no-cors mode, we can't read the response
      // We'll show a message and redirect after a delay
      setSuccess('Registration submitted successfully!')
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'driver'
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        setSuccess('Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 1000)
      }, 2000)
    } catch (err) {
      console.error('Registration error:', err)
      if (!navigator.onLine) {
        setError('No internet connection. Please check your connection and try again.')
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please try again later.')
      } else if (err.message.includes('already exists')) {
        setError('An account with this email already exists. Please login or use a different email.')
      } else {
        setError('Registration failed. Please try again or contact support if the problem persists.')
      }
    } finally {
      setIsLoading(false)
      setSubmitting(false)
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
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Account
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

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    fullWidth
                    id="register-name"
                    name="name"
                    placeholder="Full Name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    aria-label="Full Name"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    fullWidth
                    id="register-email"
                    name="email"
                    placeholder="Email Address"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-label="Email Address"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    fullWidth
                    name="phone"
                    type="tel"
                    id="register-phone"
                    placeholder="Phone Number"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-label="Phone Number"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    id="register-password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-label="Password"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type="password"
                    id="register-confirm-password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-label="Confirm Password"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <TextField
                    select
                    fullWidth
                    name="role"
                    id="register-role"
                    placeholder="Register as"
                    value={formData.role}
                    onChange={handleChange}
                    aria-label="Register as"
                  >
                  <MenuItem value="driver">Driver</MenuItem>
                  </TextField>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || submitting}
              sx={{ mt: 3, mb: 2, position: 'relative' }}
            >
              {isLoading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px',
                    }}
                  />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button
                  onClick={() => navigate('/login')}
                  variant="text"
                  size="small"
                >
                  Already have an account? Sign in
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register