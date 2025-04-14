import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as TripIcon,
  LocalGasStation as CNGIcon,
  Report as ComplaintIcon,
  Payment as RepaymentIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon
} from '@material-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
}));

function Layout({ children }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const driverMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/driver' },
    { text: 'Add Trip', icon: <TripIcon />, path: '/driver/add-trip' },
    { text: 'Daily CNG', icon: <CNGIcon />, path: '/driver/daily-cng' },
    { text: 'Complaints', icon: <ComplaintIcon />, path: '/driver/complaints' },
    { text: 'Repayments', icon: <RepaymentIcon />, path: '/driver/repayments' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  ];

  const menuItems = currentUser?.role === 'admin' ? adminMenuItems : driverMenuItems;

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap className={classes.title}>
            Vinita Drive Ops
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1">
              {currentUser?.name}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <nav className={classes.drawer}>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
        >
          {drawer}
        </Drawer>
      </nav>

      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}

export default Layout;