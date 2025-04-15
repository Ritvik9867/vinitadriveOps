import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Stack
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { useState } from 'react'

function DashboardSummary({ data, onDateRangeChange }) {
  const {
    earnings,
    expenses,
    cashCollected,
    onlinePayments,
    netProfit,
    expenseCategories = {
      CNG: 0,
      TOLL: 0,
      OTHER: 0
    }
  } = data

  const [timeRange, setTimeRange] = useState('day')
  const [customStartDate, setCustomStartDate] = useState(null)
  const [customEndDate, setCustomEndDate] = useState(null)

  const handleTimeRangeChange = (event, newRange) => {
    if (!newRange) return
    setTimeRange(newRange)
    
    const now = new Date()
    let start, end
    
    switch (newRange) {
      case 'day':
        start = startOfDay(now)
        end = endOfDay(now)
        break
      case 'week':
        start = startOfWeek(now)
        end = endOfWeek(now)
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      case 'custom':
        return // Don't update dates for custom range
      default:
        return
    }
    
    onDateRangeChange(start, end)
  }

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(startOfDay(customStartDate), endOfDay(customEndDate))
    }
  }

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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Financial Summary</Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
          <ToggleButton value="custom">Custom</ToggleButton>
        </ToggleButtonGroup>

        {timeRange === 'custom' && (
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={customStartDate}
              onChange={(date) => {
                setCustomStartDate(date)
                handleCustomDateChange()
              }}
            />
            <DatePicker
              label="End Date"
              value={customEndDate}
              onChange={(date) => {
                setCustomEndDate(date)
                handleCustomDateChange()
              }}
            />
          </Stack>
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Total Earnings" value={earnings} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Total Expenses" value={expenses} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Net Profit" value={netProfit} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Cash Collected" value={cashCollected} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Online Payments" value={onlinePayments} color="secondary.main" />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Expense Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <SummaryCard title="CNG Expenses" value={expenseCategories.CNG} color="warning.main" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard title="Toll Expenses" value={expenseCategories.TOLL} color="warning.main" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard title="Other Expenses" value={expenseCategories.OTHER} color="warning.main" />
            </Grid>
          </Grid>
        </Grid>
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