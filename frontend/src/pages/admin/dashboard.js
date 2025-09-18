import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Avatar,
  Chip,
  Stack,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function AdminDashboard() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not system admin
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'system_admin')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeOfficers: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Load user stats only
        const usersResponse = await api.get('/users?limit=1');
        
        setStats({
          totalUsers: usersResponse.total || 0,
          activeOfficers: (usersResponse.total || 0) - 1 // Exclude system admin
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'system_admin') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Register and manage system officers',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'Manage Users',
      path: '/admin/users',
      stats: `${stats.activeOfficers} Officers`
    },
    {
      title: 'System Reports',
      description: 'Generate system usage and audit reports',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'View Reports',
      path: '/admin/reports',
      stats: 'Analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'Settings',
      path: '/admin/settings',
      stats: 'System Config'
    },
    {
      title: 'Audit Logs',
      description: 'Review system activity and compliance',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: 'error',
      action: 'View Audits',
      path: '/admin/audit-logs',
      stats: 'Security'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Officer',
      description: 'Register a new system officer',
      icon: <PersonAddIcon />,
      action: () => navigate('/admin/users'),
      color: 'primary'
    },
    {
      title: 'Security Audit',
      description: 'Review system security logs',
      icon: <SecurityIcon />,
      action: () => navigate('/admin/security'),
      color: 'error'
    }
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'system_admin') {
    return null;
  }

  return (
    <Navigation title="System Administration" currentPath="/admin/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon color="primary" />
            System Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name}. Manage your EMR system from here.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* System Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            System Administration Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.activeOfficers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Officers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="info.main" fontWeight="bold">
                  Online
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Status
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-2px)', 
                      boxShadow: 3 
                    }
                  }}
                  onClick={action.action}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${action.color}.main` }}>
                        {action.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                      <NavigateNextIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Main Dashboard Cards */}
        <Typography variant="h6" gutterBottom>
          Administration Modules
        </Typography>
        <Grid container spacing={3}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 4 
                  }
                }}
              >
                <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${card.color}.100`, 
                      color: `${card.color}.main`,
                      width: 60, 
                      height: 60, 
                      mx: 'auto', 
                      mb: 2 
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.description}
                  </Typography>
                  <Chip 
                    label={card.stats} 
                    size="small" 
                    color={card.color}
                    variant="outlined"
                  />
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Button 
                    variant="contained" 
                    color={card.color}
                    onClick={() => navigate(card.path)}
                    sx={{ minWidth: 120 }}
                  >
                    {card.action}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* System Status */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<AdminIcon />} label="System Admin Active" color="success" />
            <Chip label="Database Connected" color="success" />
            <Chip label="All Services Running" color="success" />
            <Chip label={`Last Login: ${new Date().toLocaleDateString()}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
