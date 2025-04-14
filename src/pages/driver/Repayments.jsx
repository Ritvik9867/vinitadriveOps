import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useAuth } from '../../contexts/AuthContext';
import { addToSyncQueue, setToDB, getAllFromDB } from '../../utils/indexedDB';

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
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: theme.spacing(2)
  },
  uploadButton: {
    marginTop: theme.spacing(2)
  },
  repaymentsList: {
    marginTop: theme.spacing(4)
  },
  pending: {
    backgroundColor: theme.palette.warning.main
  },
  approved: {
    backgroundColor: theme.palette.success.main
  },
  rejected: {
    backgroundColor: theme.palette.error.main
  },
  advanceInfo: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default
  }
}));

function Repayments() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    screenshot: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [repayments, setRepayments] = useState([]);
  const [advanceInfo, setAdvanceInfo] = useState({
    totalAdvance: 0,
    totalRepaid: 0,
    remaining: 0
  });

  useEffect(() => {
    loadRepayments();
  }, []);

  const loadRepayments = async () => {
    try {
      const userRepayments = await getAllFromDB('repayments') || [];
      const driverRepayments = userRepayments.filter(r => r.driverId === currentUser.id);
      setRepayments(driverRepayments);

      // Calculate advance info
      const advances = await getAllFromDB('advances') || [];
      const driverAdvances = advances.filter(a => a.driverId === currentUser.id);
      
      const totalAdvance = driverAdvances.reduce((sum, adv) => sum + adv.amount, 0);
      const totalRepaid = driverRepayments
        .filter(rep => rep.status === 'approved')
        .reduce((sum, rep) => sum + rep.amount, 0);

      setAdvanceInfo({
        totalAdvance,
        totalRepaid,
        remaining: totalAdvance - totalRepaid
      });
    } catch (err) {
      console.error('Error loading repayments:', err);
    }
  };

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
        screenshot: file
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
    
    if (!formData.screenshot) {
      setError('Please upload a payment screenshot');
      return;
    }

    if (parseFloat(formData.amount) > advanceInfo.remaining) {
      setError('Repayment amount cannot exceed remaining advance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const repaymentData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        driverId: currentUser.id,
        driverName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'pending',
        screenshot: imagePreview // Store base64 image temporarily
      };

      // Save to IndexedDB
      await setToDB('repayments', repaymentData);
      
      // Add to sync queue for later sync with Google Drive and Sheets
      await addToSyncQueue({
        type: 'ADD_REPAYMENT',
        data: repaymentData
      });

      setSuccess(true);
      setFormData({
        amount: '',
        description: '',
        screenshot: null
      });
      setImagePreview('');
      loadRepayments(); // Refresh repayments list
    } catch (err) {
      setError('Failed to submit repayment');
      console.error('Error submitting repayment:', err);
    }

    setLoading(false);
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status.toUpperCase()}
        className={classes[status.toLowerCase()]}
        size="small"
      />
    );
  };

  return (
    <Paper className={classes.root}>
      <Box className={classes.advanceInfo}>
        <Typography variant="h6" gutterBottom>
          Advance Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Advance: ₹{advanceInfo.totalAdvance}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Repaid: ₹{advanceInfo.totalRepaid}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Remaining: ₹{advanceInfo.remaining}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Submit Repayment
      </Typography>

      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="amount"
              label="Repayment Amount"
              type="number"
              required
              fullWidth
              variant="outlined"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: '₹',
                inputProps: { min: 0, max: advanceInfo.remaining }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Payment Description"
              required
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., UPI transaction ID or payment reference"
            />
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
              Upload Payment Screenshot (Required)
            </Button>

            {imagePreview && (
              <Box mt={2} display="flex" justifyContent="center">
                <img
                  src={imagePreview}
                  alt="Payment Screenshot"
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
          disabled={loading || advanceInfo.remaining === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Repayment'}
        </Button>
      </form>

      <div className={classes.repaymentsList}>
        <Typography variant="h6" gutterBottom>
          Your Repayments
        </Typography>
        <List>
          {repayments.map((repayment, index) => (
            <React.Fragment key={repayment.timestamp}>
              <ListItem>
                <ListItemText
                  primary={`₹${repayment.amount}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {new Date(repayment.timestamp).toLocaleDateString()}
                      </Typography>
                      <br />
                      {repayment.description}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {getStatusChip(repayment.status)}
                </ListItemSecondaryAction>
              </ListItem>
              {index < repayments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {repayments.length === 0 && (
            <ListItem>
              <ListItemText primary="No repayments submitted yet" />
            </ListItem>
          )}
        </List>
      </div>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          Repayment submitted successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Repayments;