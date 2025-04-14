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
  complaintsList: {
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
  }
}));

function Complaints() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const userComplaints = await getAllFromDB('complaints') || [];
      setComplaints(userComplaints.filter(c => c.driverId === currentUser.id));
    } catch (err) {
      console.error('Error loading complaints:', err);
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
        image: file
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
    
    if (!formData.image) {
      setError('Please upload an image for proof');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const complaintData = {
        title: formData.title,
        description: formData.description,
        driverId: currentUser.id,
        driverName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'pending',
        imageProof: imagePreview // Store base64 image temporarily
      };

      // Save to IndexedDB
      await setToDB('complaints', complaintData);
      
      // Add to sync queue for later sync with Google Drive and Sheets
      await addToSyncQueue({
        type: 'ADD_COMPLAINT',
        data: complaintData
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        image: null
      });
      setImagePreview('');
      loadComplaints(); // Refresh complaints list
    } catch (err) {
      setError('Failed to submit complaint');
      console.error('Error submitting complaint:', err);
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
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Submit Complaint
      </Typography>

      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Complaint Title"
              required
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Complaint Description"
              required
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
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
              Upload Image Proof (Required)
            </Button>

            {imagePreview && (
              <Box mt={2} display="flex" justifyContent="center">
                <img
                  src={imagePreview}
                  alt="Complaint Proof"
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
          {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
        </Button>
      </form>

      <div className={classes.complaintsList}>
        <Typography variant="h6" gutterBottom>
          Your Complaints
        </Typography>
        <List>
          {complaints.map((complaint, index) => (
            <React.Fragment key={complaint.timestamp}>
              <ListItem>
                <ListItemText
                  primary={complaint.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {new Date(complaint.timestamp).toLocaleDateString()}
                      </Typography>
                      <br />
                      {complaint.description}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {getStatusChip(complaint.status)}
                </ListItemSecondaryAction>
              </ListItem>
              {index < complaints.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {complaints.length === 0 && (
            <ListItem>
              <ListItemText primary="No complaints submitted yet" />
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
          Complaint submitted successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Complaints;