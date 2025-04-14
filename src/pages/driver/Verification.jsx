import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useAuth } from '../../contexts/AuthContext';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: theme.spacing(2),
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  }
}));

function Verification() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef();
  
  const [odReading, setOdReading] = useState('');
  const [odImage, setOdImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setOdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!odImage) {
      return setError('Please upload the OD meter image');
    }

    if (!odReading) {
      return setError('Please enter the OD reading');
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('action', 'verifyDriver');
      formData.append('driverId', currentUser.id);
      formData.append('odReading', odReading);
      formData.append('odImage', odImage);
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        navigate('/driver');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Failed to submit verification');
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Typography component="h1" variant="h5">
          Driver Verification
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Please upload a clear image of your vehicle's odometer and enter the current reading
        </Typography>

        <form className={classes.form} onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => fileInputRef.current.click()}
            className={classes.uploadButton}
          >
            Upload OD Meter Image
          </Button>

          {imagePreview && (
            <Box mt={2} display="flex" justifyContent="center">
              <img src={imagePreview} alt="OD Preview" className={classes.imagePreview} />
            </Box>
          )}

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="OD Reading (KM)"
            type="number"
            value={odReading}
            onChange={(e) => setOdReading(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Verification'}
          </Button>
        </form>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default Verification;