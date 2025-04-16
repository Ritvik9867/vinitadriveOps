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
  const [selectedDriver, setSelectedDriver] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  })
  const [dashboardData, setDashboardData] = useState({
    earnings: [],
    expenses: [],
    attendance: [],
    pendingApprovals: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [selectedDriver, dateRange])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'getAdminDashboard',
          driverId: selectedDriver,
          startDate: dateRange.start?.toISOString(),
          endDate: dateRange.end?.toISOString(),
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
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Approval update error:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                            onClick={() => handleApproval(item.type, item.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleApproval(item.type, item.id, 'rejected')}
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