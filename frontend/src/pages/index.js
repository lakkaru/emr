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
  Assessment as AssessmentIcon, Groups as GroupsIcon, Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { apiClient } from '../utils/api';

const drawerWidth = 240;

export default function IndexPage() {
  const { user, token, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hasUsers, setHasUsers] = React.useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {
    const api = apiClient();
    api.get('/auth/has-users')
      .then(r => setHasUsers(r.hasUsers))
      .catch(() => setHasUsers(true));
  }, []);

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
            {!hasUsers ? (
              <Button variant="outlined" onClick={go('/setup')} startIcon={<SettingsIcon />}>
                First-time Setup
              </Button>
            ) : (
              <Button variant="outlined" onClick={go('/admin/profile')} startIcon={<PersonIcon />}>
                Admin Profile
              </Button>
            )}
          </Stack>
        </Card>
      </Box>
    );
  }

  // Navigation items based on role
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk', 'lab_officer', 'pharmacy_officer'] },
    { text: 'Patient Registration', icon: <PersonAddIcon />, path: '/register', roles: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk'] },
    { text: 'Manage Patients', icon: <GroupsIcon />, path: '/admin/patients', roles: ['system_admin'] },
    { text: 'Audit Logs', icon: <AssessmentIcon />, path: '/admin/audits', roles: ['system_admin'] },
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
        roles: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk']
      }
    ];

    if (user?.role === 'system_admin') {
      cards.push(
        {
          title: 'Patient Management',
          description: 'View and edit existing patient records',
          icon: <GroupsIcon />,
          action: 'Manage Patients',
          path: '/admin/patients',
          color: 'secondary',
          roles: ['system_admin']
        },
        {
          title: 'System Audit',
          description: 'Review system activity and compliance logs',
          icon: <AssessmentIcon />,
          action: 'View Audits',
          path: '/admin/audits',
          color: 'warning',
          roles: ['system_admin']
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
    <Navigation title="Dashboard" currentPath="/"  >

      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 4
      }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            Welcome back, {user?.name}
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
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
    </Navigation>
  );
}
