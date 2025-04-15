import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { format } from 'date-fns'

function DashboardSummary({ data, onDateRangeChange }) {
  const {
    earnings,
    expenses,
    cashCollected,
    onlinePayments,
    netProfit,
  } = data

  const SummaryCard = ({ title, value, color = 'primary.main' }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="h5"
        component="div"
        color={color}
        sx={{ fontWeight: 'medium' }}
      >
        ₹{value.toLocaleString()}
      </Typography>
    </Paper>
  )

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Financial Summary
      </Typography>

      <Grid container spacing={3}>
        {/* Earnings Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Earnings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <SummaryCard title="Today" value={earnings.daily} />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard title="This Week" value={earnings.weekly} />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard title="This Month" value={earnings.monthly} />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard title="This Year" value={earnings.yearly} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Expenses Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Expenses
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <SummaryCard
                  title="CNG"
                  value={expenses.cng}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard
                  title="Toll"
                  value={expenses.toll}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard
                  title="Other"
                  value={expenses.other}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={6}>
                <SummaryCard
                  title="Total"
                  value={Object.values(expenses).reduce((a, b) => a + b, 0)}
                  color="error.main"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Payments & Profit Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Cash Collected"
                  value={cashCollected}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Online Payments"
                  value={onlinePayments}
                  color="info.main"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Net Profit"
                  value={netProfit}
                  color={netProfit >= 0 ? 'success.main' : 'error.main'}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardSummary