import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  TextField,
  MenuItem
} from '@material-ui/core';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  GetApp as DownloadIcon
} from '@material-ui/icons';
import { Line, Bar } from 'chart.js/auto';
import { useAuth } from '../../contexts/AuthContext';
import { getAllFromDB } from '../../utils/indexedDB';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    height: '100%',
  },
  filterContainer: {
    marginBottom: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  pending: {
    backgroundColor: theme.palette.warning.main,
  },
  approved: {
    backgroundColor: theme.palette.success.main,
  },
  rejected: {
    backgroundColor: theme.palette.error.main,
  },
  chartContainer: {
    height: 300,
    marginTop: theme.spacing(2),
  },
}));

function AdminDashboard() {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [data, setData] = useState({
    drivers: [],
    trips: [],
    expenses: [],
    complaints: [],
    repayments: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const drivers = await getAllFromDB('drivers') || [];
      const trips = await getAllFromDB('trips') || [];
      const expenses = await getAllFromDB('expenses') || [];
      const complaints = await getAllFromDB('complaints') || [];
      const repayments = await getAllFromDB('repayments') || [];

      setData({ drivers, trips, expenses, complaints, repayments });
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproval = async (type, id, status) => {
    try {
      const items = await getAllFromDB(type);
      const itemIndex = items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        items[itemIndex].status = status;
        await setToDB(type, items[itemIndex]);
        
        // Add to sync queue
        await addToSyncQueue({
          type: `UPDATE_${type.toUpperCase()}`,
          data: items[itemIndex]
        });

        // Refresh data
        loadDashboardData();
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleDownload = (type) => {
    const data = getFilteredData(type);
    const headers = {
      trips: ['Date', 'Driver', 'Distance (KM)', 'Amount', 'Payment Mode', 'Cash Collected'],
      expenses: ['Date', 'Driver', 'Type', 'Amount', 'Status']
    };

    const csvContent = [
      headers[type].join(','),
      ...data.map(item => {
        if (type === 'trips') {
          return [
            item.date,
            item.driverName,
            item.distance,
            item.amount,
            item.paymentMode,
            item.cashCollected || 0
          ].join(',');
        } else {
          return [
            item.date,
            item.driverName,
            item.type,
            item.amount,
            item.status
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getFilteredData = (type) => {
    const items = data[type] || [];
    return items.filter(item => {
      const matchesDriver = selectedDriver === 'all' || item.driverId === selectedDriver;
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return matchesDriver && itemDate >= startDate && itemDate <= endDate;
    });
  };

  const getStatusChip = (status) => (
    <Chip
      label={status.toUpperCase()}
      className={classes[status.toLowerCase()]}
      size="small"
    />
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Box className={classes.filterContainer}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Select Driver"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="all">All Drivers</MenuItem>
                {data.drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                fullWidth
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                fullWidth
                label="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Trips" />
          <Tab label="Expenses" />
          <Tab label="Complaints" />
          <Tab label="Repayments" />
        </Tabs>

        {tabValue === 0 && (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper className={classes.paper}>
                  <Typography variant="h6" gutterBottom>
                    Earnings Overview
                  </Typography>
                  <div className={classes.chartContainer}>
                    <canvas
                      id="earningsChart"
                      ref={(el) => {
                        if (el) {
                          const ctx = el.getContext('2d');
                          new Line(ctx, {
                            data: {
                              labels: getFilteredData('trips')
                                .slice(-7)
                                .map(trip => trip.date),
                              datasets: [{
                                label: 'Daily Earnings',
                                data: getFilteredData('trips')
                                  .slice(-7)
                                  .map(trip => trip.amount),
                                borderColor: '#4caf50',
                                tension: 0.1
                              }]
                            },
                            options: {
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: value => `₹${value}`
                                  }
                                }
                              }
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className={classes.paper}>
                  <Typography variant="h6" gutterBottom>
                    Driver Performance
                  </Typography>
                  <div className={classes.chartContainer}>
                    <canvas
                      id="performanceChart"
                      ref={(el) => {
                        if (el) {
                          const ctx = el.getContext('2d');
                          new Bar(ctx, {
                            data: {
                              labels: data.drivers.map(driver => driver.name),
                              datasets: [{
                                label: 'Total Trips',
                                data: data.drivers.map(driver => 
                                  getFilteredData('trips').filter(t => t.driverId === driver.id).length
                                ),
                                backgroundColor: '#2196f3'
                              }]
                            },
                            options: {
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1
                                  }
                                }
                              }
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <TableContainer className={classes.tableContainer}>
            <Box mb={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload('trips')}
              >
                Download Report
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Distance (KM)</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell>Cash Collected</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredData('trips').map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.date}</TableCell>
                    <TableCell>{trip.driverName}</TableCell>
                    <TableCell>{trip.distance}</TableCell>
                    <TableCell>₹{trip.amount}</TableCell>
                    <TableCell>{trip.paymentMode}</TableCell>
                    <TableCell>₹{trip.cashCollected || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 2 && (
          <TableContainer className={classes.tableContainer}>
            <Box mb={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload('expenses')}
              >
                Download Report
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredData('expenses').map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.driverName}</TableCell>
                    <TableCell>{expense.type}</TableCell>
                    <TableCell>₹{expense.amount}</TableCell>
                    <TableCell>{getStatusChip(expense.status)}</TableCell>
                    <TableCell>
                      {expense.status === 'pending' && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleApproval('expenses', expense.id, 'approved')}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleApproval('expenses', expense.id, 'rejected')}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 3 && (
          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredData('complaints').map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.date}</TableCell>
                    <TableCell>{complaint.driverName}</TableCell>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>{complaint.description}</TableCell>
                    <TableCell>{getStatusChip(complaint.status)}</TableCell>
                    <TableCell>
                      {complaint.status === 'pending' && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleApproval('complaints', complaint.id, 'approved')}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleApproval('complaints', complaint.id, 'rejected')}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 4 && (
          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredData('repayments').map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell>{repayment.date}</TableCell>
                    <TableCell>{repayment.driverName}</TableCell>
                    <TableCell>₹{repayment.amount}</TableCell>
                    <TableCell>{repayment.description}</TableCell>
                    <TableCell>{getStatusChip(repayment.status)}</TableCell>
                    <TableCell>
                      {repayment.status === 'pending' && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleApproval('repayments', repayment.id, 'approved')}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleApproval('repayments', repayment.id, 'rejected')}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
}

export default AdminDashboard;