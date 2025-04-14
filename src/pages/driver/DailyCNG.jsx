import React, { useState, useRef } from 'react';
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
  },
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: theme.spacing(2)
  },
  uploadButton: {
    marginTop: theme.spacing(2)
  }
}));

function DailyCNG() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    amount: '',
    paidBy: 'driver',
    receipt: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.receipt) {
      setError('Please upload the CNG receipt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const expenseData = {
        type: 'CNG',
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        driverId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        receiptImage: imagePreview // Store base64 image temporarily
      };

      // Save to IndexedDB
      await setToDB('expenses', expenseData);
      
      // Add to sync queue for later sync with Google Drive and Sheets
      await addToSyncQueue({
        type: 'ADD_CNG_EXPENSE',
        data: expenseData
      });

      setSuccess(true);
      setFormData({
        amount: '',
        paidBy: 'driver',
        receipt: null
      });
      setImagePreview('');
    } catch (err) {
      setError('Failed to save CNG expense');
      console.error('Error saving CNG expense:', err);
    }

    setLoading(false);
  };

  return (
    <Paper className={classes.root}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Add CNG Expense
      </Typography>

      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="amount"
              label="CNG Amount"
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
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel>Paid By</InputLabel>
              <Select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                label="Paid By"
                required
              >
                <MenuItem value="driver">Driver's Cash</MenuItem>
                <MenuItem value="online">Online Payment</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
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
              Upload Receipt Image (Required)
            </Button>

            {imagePreview && (
              <Box mt={2} display="flex" justifyContent="center">
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  className={classes.imagePreview}
                />
              </Box>
            )}
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Add CNG Expense'}
        </Button>
      </form>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          CNG expense added successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default DailyCNG;