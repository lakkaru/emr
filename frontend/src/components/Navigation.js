import React from 'react';
import { navigate } from 'gatsby';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  PersonAdd as RegisterIcon,
  Menu as MenuIcon,
  ArrowBack as BackIcon,
  LocalHospital as HospitalIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as UserManagementIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName } from '../utils/roles';

const drawerWidth = 280;

const getNavigationItems = (userRole) => {
  const items = [];

  if (userRole === 'system_admin') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
      { text: 'User Management', icon: <UserManagementIcon />, path: '/admin/users' },
      { text: 'Admin Profile', icon: <AdminIcon />, path: '/admin/profile' }
    );
  } else if (userRole === 'front_desk') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/front-desk/dashboard' },
      { text: 'Register Patient', icon: <RegisterIcon />, path: '/register' },
      { text: 'Patient Management', icon: <PatientsIcon />, path: '/admin/patients' }
    );
  } else if (userRole === 'medical_officer') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/medical/dashboard' },
      { text: 'Patient Records', icon: <PatientsIcon />, path: '/admin/patients' }
    );
  } else if (userRole === 'nursing_officer') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/nursing/dashboard' },
      { text: 'Patient Care', icon: <PatientsIcon />, path: '/admin/patients' }
    );
  } else if (userRole === 'lab_officer') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/lab/dashboard' }
    );
  } else if (userRole === 'pharmacy_officer') {
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/pharmacy/dashboard' }
    );
  } else {
    // Default fallback
    items.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' }
    );
  }

  return items;
};

export default function Navigation({ 
  title = 'EMR System', 
  children, 
  showBackButton = false, 
  onBack = null,
  currentPath = '/'
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mx: 'auto', mb: 1 }}>
          <HospitalIcon />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          EMR System
        </Typography>
        <Typography variant="caption">
          Electronic Medical Records
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              <AdminIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {user.name}
              </Typography>
              <Chip 
                label={getRoleDisplayName(user.role)} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Navigation Items */}
      <List>
        {getNavigationItems(user?.role).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={currentPath === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: currentPath === item.path ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {showBackButton && (
            <IconButton
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              <BackIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {user && (
            <Chip
              label={`${user.name} (${getRoleDisplayName(user.role)})`}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Account for app bar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
