import { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Alert,
} from '@mui/material'
import { Camera } from '@capacitor/camera'
import { Filesystem } from '@capacitor/filesystem'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function DriverDashboard() {
  const [activeTab, setActiveTab] = useState(0)
  const [dashboardData, setDashboardData] = useState({
    attendance: null,
    earnings: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    },
    expenses: {
      cng: 0,
      toll: 0,
      other: 0,
      challan: 0,
    },
    cashCollected: 0,
    onlinePayments: 0,
    netProfit: 0,
  })
  const [tripData, setTripData] = useState({
    amount: '',
    paymentMode: 'online',
    toll: '',
    cashReceived: '',
  })
  const [cngData, setCngData] = useState({
    amount: '',
    paymentMode: 'cash',
    billImage: null,
  })
  const [complaintData, setComplaintData] = useState({
    reason: '',
    description: '',
    image: null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDashboardData()
    checkAttendance()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'getDriverDashboard',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDashboardData(data.dashboard)
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    }
  }

  const checkAttendance = async () => {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'checkAttendance',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDashboardData(prev => ({ ...prev, attendance: data.attendance }))
      }
    } catch (error) {
      console.error('Attendance check error:', error)
    }
  }

  const handleAttendance = async (type) => {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: type === 'login' ? 'markAttendance' : 'markLogout',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDashboardData(prev => ({ ...prev, attendance: data.attendance }))
        setSuccess(`${type === 'login' ? 'Login' : 'Logout'} marked successfully`)
      }
    } catch (error) {
      setError('Failed to mark attendance')
      console.error('Attendance marking error:', error)
    }
  }

  const handleTripSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'addTrip',
          ...tripData,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Trip added successfully')
        setTripData({
          amount: '',
          paymentMode: 'online',
          toll: '',
          cashReceived: '',
        })
        fetchDashboardData()
      }
    } catch (error) {
      setError('Failed to add trip')
      console.error('Trip submission error:', error)
    }
  }

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
      })
      return image.base64String
    } catch (error) {
      console.error('Camera error:', error)
      return null
    }
  }

  const handleCNGSubmit = async (e) => {
    e.preventDefault()
    try {
      const imageBase64 = await takePicture()
      if (!imageBase64) {
        setError('Please take a picture of the CNG bill')
        return
      }

      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'addCNGExpense',
          ...cngData,
          billImage: imageBase64,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('CNG expense added successfully')
        setCngData({
          amount: '',
          paymentMode: 'cash',
          billImage: null,
        })
        fetchDashboardData()
      }
    } catch (error) {
      setError('Failed to add CNG expense')
      console.error('CNG submission error:', error)
    }
  }

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    try {
      const imageBase64 = await takePicture()
      if (!imageBase64) {
        setError('Please take a picture for the complaint')
        return
      }

      const response = await fetch('YOUR_APPS_SCRIPT_DEPLOYMENT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'addComplaint',
          ...complaintData,
          image: imageBase64,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Complaint submitted successfully')
        setComplaintData({
          reason: '',
          description: '',
          image: null,
        })
      }
    } catch (error) {
      setError('Failed to submit complaint')
      console.error('Complaint submission error:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Attendance Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Attendance</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!dashboardData.attendance ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAttendance('login')}
                >
                  Mark Attendance
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleAttendance('logout')}
                >
                  Mark Logout
                </Button>
              )}
              {dashboardData.attendance && (
                <Typography variant="body1">
                  Login Time: {dashboardData.attendance.loginTime}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Dashboard Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Dashboard Overview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Daily Earnings</Typography>
                  <Typography variant="h6">₹{dashboardData.earnings.daily}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Monthly Earnings</Typography>
                  <Typography variant="h6">₹{dashboardData.earnings.monthly}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Cash Collected</Typography>
                  <Typography variant="h6">₹{dashboardData.cashCollected}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Net Profit</Typography>
                  <Typography variant="h6">₹{dashboardData.netProfit}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tabs for different features */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Trip Entry" />
              <Tab label="CNG Entry" />
              <Tab label="Complaint" />
            </Tabs>

            {/* Trip Entry Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box component="form" onSubmit={handleTripSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Trip Amount"
                      type="number"
                      value={tripData.amount}
                      onChange={(e) => setTripData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      required
                      fullWidth
                      label="Payment Mode"
                      value={tripData.paymentMode}
                      onChange={(e) => setTripData(prev => ({ ...prev, paymentMode: e.target.value }))}
                    >
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="cash">Cash</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Toll Amount"
                      type="number"
                      value={tripData.toll}
                      onChange={(e) => setTripData(prev => ({ ...prev, toll: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cash Received"
                      type="number"
                      value={tripData.cashReceived}
                      onChange={(e) => setTripData(prev => ({ ...prev, cashReceived: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                      Submit Trip
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* CNG Entry Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box component="form" onSubmit={handleCNGSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="CNG Amount"
                      type="number"
                      value={cngData.amount}
                      onChange={(e) => setCngData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      required
                      fullWidth
                      label="Payment Mode"
                      value={cngData.paymentMode}
                      onChange={(e) => setCngData(prev => ({ ...prev, paymentMode: e.target.value }))}
                    >
                      <MenuItem value="cash">From Cash Collected</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        const image = await takePicture()
                        if (image) {
                          setCngData(prev => ({ ...prev, billImage: image }))
                        }
                      }}
                    >
                      Take Bill Picture
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                      Submit CNG Entry
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Complaint Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box component="form" onSubmit={handleComplaintSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      required
                      fullWidth
                      label="Complaint Reason"
                      value={complaintData.reason}
                      onChange={(e) => setComplaintData(prev => ({ ...prev, reason: e.target.value }))}
                    >
                      <MenuItem value="vehicle_condition">Vehicle Condition</MenuItem>
                      <MenuItem value="cleanliness">Cleanliness</MenuItem>
                      <MenuItem value="damage">Damage</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={complaintData.description}
                      onChange={(e) => setComplaintData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        const image = await takePicture()
                        if (image) {
                          setComplaintData(prev => ({ ...prev, image }))
                        }
                      }}
                    >
                      Take Picture
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                      Submit Complaint
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DriverDashboard