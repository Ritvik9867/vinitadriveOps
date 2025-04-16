import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [showODForm, setShowODForm] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }

    try {
      console.log('Attempting login with:', { 
        email: formData.email,
        timestamp: new Date().toISOString()
      })
      
      const requestBody = {
        action: 'login',
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }
      
      console.log('Request payload:', requestBody)
      
      const response = await fetch('https://script.google.com/macros/s/AKfycbyZvR-20-RdzAcfbviv5DLuXDIubYeqmsyTdaxQlKNQnFV_yUwO9VPRo7LswZAEs4EIIg/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries([...response.headers]))

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response:', data)

        if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        if (data.user.role === 'driver' && data.isFirstLoginOfDay) {
          setIsFirstLogin(true)
          setShowODForm(true)
        } else {
          // Redirect based on user role
          navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/')
        }
        } else {
          setError(data.error || 'Invalid credentials')
        }
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr)
        throw new Error('Invalid response format from server')
      }
    } catch (err) {
      console.error('Login error details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        formData: { email: formData.email }
      })

      if (!navigator.onLine) {
        setError('Please check your internet connection')
      } else if (err.name === 'SyntaxError') {
        setError('Invalid response from server. Please try again')
      } else if (err.message.includes('HTTP error')) {
        setError('Server error. Please try again later')
      } else {
        setError(err.message || 'Login failed. Please try again')
      }
    }
  }

  const handleODSubmit = async (odData) => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyZvR-20-RdzAcfbviv5DLuXDIubYeqmsyTdaxQlKNQnFV_yUwO9VPRo7LswZAEs4EIIg/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            action: 'submitODReading',
            ...odData,
          }),
        })

        const data = await response.json()
        if (data.success) {
          setShowODForm(false)
          navigate('/')
        } else {
          setError(data.message || 'Failed to submit OD reading')
        }
      } catch (err) {
        setError('Failed to submit OD reading. Please try again.')
        console.error('OD submission error:', err)
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
            >
              Sign In
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
          <ODImageForm onSubmit={handleODSubmit} />
        </Box>
      </Modal>
    </Container>
  )
}

export default Login