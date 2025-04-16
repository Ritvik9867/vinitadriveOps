import { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { API_BASE_URL, getAuthHeaders } from '../config/api'

function AdminDashboard() {
  // State for filters, dashboard data, modals, alerts, and pending badges
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [dashboardData, setDashboardData] = useState({
    earnings: [],
    expenses: [],
    attendance: [],
    pendingApprovals: [],
    pendingExpenses: 0,
    pendingComplaints: 0,
    pendingRepayments: 0,
  });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: '', status: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchDashboardData()
  }, [selectedDriver, dateRange])

  // Fetch dashboard summary and pending counts
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'dashboardSummary',
          driverId: selectedDriver,
          startDate: dateRange.start?.toISOString(),
          endDate: dateRange.end?.toISOString(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setDashboardData({
          ...dashboardData,
          ...data.data,
        })
      } else {
        setAlert({ open: true, message: data.message || 'Failed to fetch dashboard', severity: 'error' })
      }
    } catch (error) {
      setAlert({ open: true, message: 'Dashboard data fetch error', severity: 'error' })
    }
  }

  // Handle approval/rejection with confirmation
  const handleApproval = async (type, id, status) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'updateApprovalStatus',
          type,
          id,
          status,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setAlert({ open: true, message: 'Status updated!', severity: 'success' })
        fetchDashboardData()
      } else {
        setAlert({ open: true, message: data.message || 'Failed to update status', severity: 'error' })
      }
    } catch (error) {
      setAlert({ open: true, message: 'Approval update error', severity: 'error' })
    }
  }

  // Download CSV report for selected driver/date range
  const handleReportDownload = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'generateReport',
          driverId: selectedDriver,
          startDate: dateRange.start?.toISOString(),
          endDate: dateRange.end?.toISOString(),
        }),
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'admin_report.csv'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      setAlert({ open: true, message: 'Failed to download report', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Alerts for success/error */}
      {alert.open && (
        <Box sx={{ mb: 2 }}>
          <Typography component="div">
            <div style={{ color: alert.severity === 'success' ? 'green' : 'red' }}>{alert.message}</div>
          </Typography>
        </Box>
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
          Pending Expenses <span style={{ marginLeft: 8, color: 'red' }}>({dashboardData.pendingExpenses || 0})</span>
        </Button>
        <Button color="info" variant="contained" disabled>
          Pending Complaints <span style={{ marginLeft: 8, color: 'red' }}>({dashboardData.pendingComplaints || 0})</span>
        </Button>
        <Button color="secondary" variant="contained" disabled>
          Pending Repayments <span style={{ marginLeft: 8, color: 'red' }}>({dashboardData.pendingRepayments || 0})</span>
        </Button>
      </Box>
      {/* Confirmation Modal */}
      {confirmModal.open && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Paper sx={{ p: 4, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Confirm Action</Typography>
            <Typography sx={{ mb: 2 }}>Are you sure you want to {confirmModal.status} this item?</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setConfirmModal({ open: false, type: '', id: '', status: '' })}>Cancel</Button>
              <Button color={confirmModal.status === 'approved' ? 'success' : 'error'} variant="contained" onClick={() => handleApproval(confirmModal.type, confirmModal.id, confirmModal.status)}>
                Confirm
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Select Driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Drivers</MenuItem>
              {/* Add driver list items here */}
            </TextField>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
            />
          </Paper>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Performance Overview</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.earnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#8884d8" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Pending Approvals</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.pendingApprovals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.driverName}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => setConfirmModal({ open: true, type: item.type, id: item.id, status: 'approved' })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => setConfirmModal({ open: true, type: item.type, id: item.id, status: 'rejected' })}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Attendance Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Attendance Summary</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Driver</TableCell>
                    <TableCell>Login Time</TableCell>
                    <TableCell>Logout Time</TableCell>
                    <TableCell>Total Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.driverName}</TableCell>
                      <TableCell>{record.loginTime}</TableCell>
                      <TableCell>{record.logoutTime}</TableCell>
                      <TableCell>{record.totalHours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AdminDashboard