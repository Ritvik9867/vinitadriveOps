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

    try {
      // Call Google Apps Script API endpoint for authentication
      const response = await fetch('https://script.google.com/macros/s/AKfycbxhD-Ks6KXGjSG_FkQGQGGFgxzOeqOF_1Z3BYyglDcRW_-rH2M/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

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
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Login error:', err)
    }
  }

  const handleODSubmit = async (odData) => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxhD-Ks6KXGjSG_FkQGQGGFgxzOeqOF_1Z3BYyglDcRW_-rH2M/exec', {
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
      >
        <ODImageForm onSubmit={handleODSubmit} />
      </Modal>
    </Container>
  )
}

export default Login