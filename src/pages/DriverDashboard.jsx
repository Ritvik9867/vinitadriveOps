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
import { API_BASE_URL, getAuthHeaders } from '../config/api'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function DriverDashboard() {
  // State for modals, badges, and alerts
  const [showShiftEndModal, setShowShiftEndModal] = useState(false);
  const [showCNGModal, setShowCNGModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [pendingRepayments, setPendingRepayments] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
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
    fetchPendingCounts()
  }, [])

  // Fetch dashboard summary from backend
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'dashboardSummary',
          driverId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      setAlert({ open: true, message: 'Dashboard data fetch error', severity: 'error' });
    }
  }

  // Fetch pending complaints/repayments for badges
  const fetchPendingCounts = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'dashboardSummary',
          driverId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPendingComplaints(data.data.pendingComplaints || 0);
        setPendingRepayments(data.data.totalRepayments || 0);
      }
    } catch (error) {
      setPendingComplaints(0);
      setPendingRepayments(0);
    }
  }

  // Handle Shift End/Logout
  const handleShiftEnd = async () => {
    setShowShiftEndModal(false);
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'shiftEnd',
          driverId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '',
          date: new Date().toISOString().slice(0, 10),
          logoutTime: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAlert({ open: true, message: 'Shift ended and work hours calculated!', severity: 'success' });
        fetchDashboardData();
      } else {
        setAlert({ open: true, message: data.message || 'Shift end failed', severity: 'error' });
      }
    } catch (error) {
      setAlert({ open: true, message: 'Shift end request failed', severity: 'error' });
    }
  }

  // Download CSV report
  const handleReportDownload = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'generateReport',
          driverId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '',
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'driver_report.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      setAlert({ open: true, message: 'Failed to download report', severity: 'error' });
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Alerts for success/error */}
      {alert.open && (
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      {/* Report Download Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" onClick={handleReportDownload}>
          Download Report (CSV)
        </Button>
      </Box>
      {/* Pending badges */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button color="warning" variant="contained" disabled>
          Pending Complaints <span style={{ marginLeft: 8, color: 'red' }}>({pendingComplaints})</span>
        </Button>
        <Button color="info" variant="contained" disabled>
          Pending Repayments <span style={{ marginLeft: 8, color: 'red' }}>({pendingRepayments})</span>
        </Button>
      </Box>
      {/* Shift End/Logout Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="error" onClick={() => setShowShiftEndModal(true)}>
          Shift End / Logout
        </Button>
      </Box>
      {/* Shift End Confirmation Modal */}
      {showShiftEndModal && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Paper sx={{ p: 4, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Confirm Shift End</Typography>
            <Typography sx={{ mb: 2 }}>Are you sure you want to end your shift and log out?</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowShiftEndModal(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleShiftEnd}>Confirm</Button>
            </Box>
          </Paper>
        </Box>
      )}

      <DashboardSummary data={dashboardData} />

      {/* Forms Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Trip Entry" />
              <Tab label="CNG Entry" />
              <Tab label="Complaint" />
              <Tab label="Expenses" />
              <Tab label="Repayments" />
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

            {/* Expenses Tab */}
            <TabPanel value={activeTab} index={3}>
              <ExpenseForm />
            </TabPanel>

            {/* Repayments Tab */}
            <TabPanel value={activeTab} index={4}>
              <RepaymentForm />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DriverDashboard