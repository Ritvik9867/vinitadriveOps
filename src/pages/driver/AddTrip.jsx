import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Grid
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useAuth } from '../../contexts/AuthContext';
import { addToSyncQueue, setToDB } from '../../utils/indexedDB';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  formControl: {
    width: '100%'
  }
}));

function AddTrip() {
  const classes = useStyles();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    amount: '',
    distance: '',
    paymentMode: 'cash',
    toll: '',
    cashCollected: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-calculate cash collected for cash payments
      cashCollected: name === 'paymentMode' && value === 'cash' ? prev.amount : prev.cashCollected
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tripData = {
        ...formData,
        driverId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        amount: parseFloat(formData.amount),
        distance: parseFloat(formData.distance),
        toll: formData.toll ? parseFloat(formData.toll) : 0,
        cashCollected: formData.cashCollected ? parseFloat(formData.cashCollected) : 0
      };

      // Save to IndexedDB
      const db = await setToDB('trips', tripData);
      
      // Add to sync queue for later sync with Google Sheets
      await addToSyncQueue({
        type: 'ADD_TRIP',
        data: tripData
      });

      setSuccess(true);
      setFormData({
        amount: '',
        distance: '',
        paymentMode: 'cash',
        toll: '',
        cashCollected: ''
      });
    } catch (err) {
      setError('Failed to save trip data');
      console.error('Error saving trip:', err);
    }

    setLoading(false);
  };

  return (
    <Paper className={classes.root}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Add New Trip
      </Typography>

      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="amount"
              label="Trip Amount"
              type="number"
              required
              fullWidth
              variant="outlined"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: '₹',
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="distance"
              label="Trip Distance (KM)"
              type="number"
              required
              fullWidth
              variant="outlined"
              value={formData.distance}
              onChange={handleChange}
              InputProps={{
                inputProps: { min: 0, step: 0.1 }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                label="Payment Mode"
                required
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="toll"
              label="Toll Amount (Optional)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.toll}
              onChange={handleChange}
              InputProps={{
                startAdornment: '₹',
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          {formData.paymentMode === 'cash' && (
            <Grid item xs={12}>
              <TextField
                name="cashCollected"
                label="Cash Collected"
                type="number"
                required
                fullWidth
                variant="outlined"
                value={formData.cashCollected}
                onChange={handleChange}
                InputProps={{
                  startAdornment: '₹',
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
          )}
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Trip'}
        </Button>
      </form>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          Trip added successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AddTrip;