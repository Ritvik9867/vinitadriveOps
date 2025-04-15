import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import { Camera } from '@capacitor/camera'

function ODImageForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    odReading: '',
    image: null,
  })
  const [error, setError] = useState('')

  const handleODChange = (e) => {
    setFormData(prev => ({
      ...prev,
      odReading: e.target.value
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.odReading) {
      setError('Please enter OD reading')
      return
    }

    if (!formData.image) {
      setError('Please take a picture of OD reading')
      return
    }

    try {
      onSubmit({
        odReading: formData.odReading,
        image: formData.image,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      setError('Failed to submit OD reading. Please try again.')
      console.error('OD submission error:', err)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Daily OD Reading
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="odReading"
            label="OD Reading"
            name="odReading"
            type="number"
            value={formData.odReading}
            onChange={handleODChange}
          />

          <Button
            fullWidth
            variant="outlined"
            onClick={takePicture}
            sx={{ mt: 2, mb: 2 }}
          >
            {formData.image ? 'Retake Picture' : 'Take Picture'}
          </Button>

          {formData.image && (
            <Box sx={{ mb: 2 }}>
              <img
                src={`data:image/jpeg;base64,${formData.image}`}
                alt="OD reading"
                style={{ width: '100%', borderRadius: 4 }}
              />
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default ODImageForm