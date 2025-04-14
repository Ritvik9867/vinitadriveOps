import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@material-ui/core';
import {
  AttachMoney as MoneyIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as GasIcon,
  Timeline as TimelineIcon
} from '@material-ui/icons';
import { Line } from 'chart.js/auto';
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
  statCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statIcon: {
    fontSize: 40,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  chartContainer: {
    marginTop: theme.spacing(4),
    height: 300,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
}));

function Dashboard() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyEarnings: 0,
    monthlyEarnings: 0,
    totalKm: 0,
    cngExpense: 0,
  });
  const [trips, setTrips] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load trips from IndexedDB
      const localTrips = await getAllFromDB('trips') || [];
      const localExpenses = await getAllFromDB('expenses') || [];

      // Calculate statistics
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.substring(0, 7);

      const dailyTrips = localTrips.filter(trip => trip.date.startsWith(today));
      const monthlyTrips = localTrips.filter(trip => trip.date.startsWith(thisMonth));
      
      const dailyEarnings = dailyTrips.reduce((sum, trip) => sum + trip.amount, 0);
      const monthlyEarnings = monthlyTrips.reduce((sum, trip) => sum + trip.amount, 0);
      
      const totalKm = localTrips.reduce((sum, trip) => sum + trip.distance, 0);
      const cngExpense = localExpenses
        .filter(expense => expense.type === 'CNG')
        .reduce((sum, expense) => sum + expense.amount, 0);

      setStats({
        dailyEarnings,
        monthlyEarnings,
        totalKm,
        cngExpense,
      });

      setTrips(localTrips);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <MoneyIcon className={classes.statIcon} />
              <Typography variant="h6" component="h2">
                Today's Earnings
              </Typography>
              <Typography variant="h4" component="p">
                ₹{stats.dailyEarnings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <TimelineIcon className={classes.statIcon} />
              <Typography variant="h6" component="h2">
                Monthly Earnings
              </Typography>
              <Typography variant="h4" component="p">
                ₹{stats.monthlyEarnings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <CarIcon className={classes.statIcon} />
              <Typography variant="h6" component="h2">
                Total KM Driven
              </Typography>
              <Typography variant="h4" component="p">
                {stats.totalKm} KM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <GasIcon className={classes.statIcon} />
              <Typography variant="h6" component="h2">
                CNG Expenses
              </Typography>
              <Typography variant="h4" component="p">
                ₹{stats.cngExpense}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Trips Table */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Box mb={2}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Recent Trips" />
                <Tab label="Today's Summary" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Distance (KM)</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Mode</TableCell>
                      <TableCell>Cash Collected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trips.slice(0, 10).map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>{trip.date}</TableCell>
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

            {tabValue === 1 && (
              <Box p={2}>
                <Typography variant="h6" gutterBottom>
                  Today's Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      Total Trips: {trips.filter(trip => trip.date === new Date().toISOString().split('T')[0]).length}
                    </Typography>
                    <Typography>
                      Total Earnings: ₹{stats.dailyEarnings}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      Your Share (50%): ₹{stats.dailyEarnings / 2}
                    </Typography>
                    <Typography>
                      Admin Share (50%): ₹{stats.dailyEarnings / 2}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;