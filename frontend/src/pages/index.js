import * as React from 'react';
import { navigate } from 'gatsby';
import {
  AppBar, Toolbar, Typography, Box, Card, CardContent, CardActions, Button, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Grid,
  Chip, Avatar, Stack, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon, Person as PersonIcon, PersonAdd as PersonAddIcon,
  Dashboard as DashboardIcon, Assignment as AssignmentIcon, Security as SecurityIcon,
  ExitToApp as LogoutIcon, LocalHospital as HospitalIcon, 
  Assessment as AssessmentIcon, Groups as GroupsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function IndexPage() {
  const { user, token, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const go = (path) => () => navigate(path);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Unauthenticated welcome screen
  if (!token) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{ maxWidth: 400, p: 3, textAlign: 'center' }}>
          <HospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            EMR System
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Electronic Medical Records - HIPAA Compliant Patient Registration & Management
          </Typography>
          <Stack spacing={2}>
            <Button variant="contained" size="large" onClick={go('/login')}>
              Sign In
            </Button>
            <Button variant="outlined" onClick={go('/setup')}>
              First-time Setup
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  // Navigation items based on role
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'doctor', 'nurse', 'clerk'] },
    { text: 'Patient Registration', icon: <PersonAddIcon />, path: '/register', roles: ['admin', 'doctor', 'nurse', 'clerk'] },
    { text: 'Manage Patients', icon: <GroupsIcon />, path: '/admin/patients', roles: ['admin'] },
    { text: 'Audit Logs', icon: <AssessmentIcon />, path: '/admin/audits', roles: ['admin'] },
  ];

  const userNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  // Dashboard cards based on role
  const getDashboardCards = () => {
    const cards = [
      {
        title: 'Patient Registration',
        description: 'Register new patients with comprehensive intake forms',
        icon: <PersonAddIcon />,
        action: 'Register Patient',
        path: '/register',
        color: 'primary',
        roles: ['admin', 'doctor', 'nurse', 'clerk']
      }
    ];

    if (user?.role === 'admin') {
      cards.push(
        {
          title: 'Patient Management',
          description: 'View and edit existing patient records',
          icon: <GroupsIcon />,
          action: 'Manage Patients',
          path: '/admin/patients',
          color: 'secondary',
          roles: ['admin']
        },
        {
          title: 'System Audit',
          description: 'Review system activity and compliance logs',
          icon: <AssessmentIcon />,
          action: 'View Audits',
          path: '/admin/audits',
          color: 'warning',
          roles: ['admin']
        }
      );
    }

    return cards.filter(card => card.roles.includes(user?.role || ''));
  };

  const drawer = (
    <Box>
      <Toolbar>
        <HospitalIcon sx={{ mr: 1 }} />
        <Typography variant="h6">EMR System</Typography>
      </Toolbar>
      <Divider />
      <List>
        {userNavItems.map((item) => (
          <ListItem button key={item.text} onClick={go(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={logout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              icon={<SecurityIcon />} 
              label={user?.role?.toUpperCase()} 
              color="secondary" 
              variant="outlined" 
            />
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Electronic Medical Records System - Streamline patient care with efficient documentation
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {getDashboardCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${card.color}.main`, mr: 2 }}>
                      {card.icon}
                    </Avatar>
                    <Typography variant="h6" component="h2">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color={card.color} 
                    variant="contained"
                    onClick={go(card.path)}
                    fullWidth
                  >
                    {card.action}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats or Info Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            System Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2">HIPAA Compliant</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2">Audit Trails</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2">Role-Based Access</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <HospitalIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2">Mobile-First</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
