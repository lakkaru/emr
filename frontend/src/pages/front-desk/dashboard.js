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
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Event as EventIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function FrontDeskDashboard() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not front desk officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'front_desk')) {
      navigate('/login');
    }
  }, [token, user]);

  const [stats, setStats] = React.useState({
    todayRegistrations: 0,
    totalPatients: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const patientsResponse = await api.get('/patients?limit=1');
        
        setStats({
          todayRegistrations: 0, // TODO: Implement today's count
          totalPatients: patientsResponse.total || 0,
          pendingAppointments: 0 // TODO: Implement appointments
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'front_desk') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'Register New Patient',
      description: 'Add new patients to the EMR system',
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'Register Patient',
      path: '/register',
      priority: 'high'
    },
    {
      title: 'Patient Management',
      description: 'Search, view, and manage patient records',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      action: 'Manage Patients',
      path: '/admin/patients',
      priority: 'high'
    },
    {
      title: 'Patient Search',
      description: 'Quick search for existing patients',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'Search Patients',
      path: '/admin/patients',
      priority: 'high'
    },
    {
      title: 'Appointments',
      description: 'Schedule and manage patient appointments',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'View Schedule',
      path: '/appointments',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: 'Emergency Registration',
      description: 'Quick registration for emergency patients',
      icon: <PersonAddIcon />,
      action: () => navigate('/register?emergency=true'),
      color: 'error'
    },
    {
      title: 'Patient Check-in',
      description: 'Check-in existing patients',
      icon: <EventIcon />,
      action: () => navigate('/checkin'),
      color: 'success'
    }
  ];

  if (!user || user.role !== 'front_desk') {
    return null;
  }

  return (
    <Navigation title="Front Desk Dashboard" currentPath="/front-desk/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PeopleIcon color="primary" />
            Front Desk Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name}. Manage patient reception and administrative tasks.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Patient Management Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Patient Management Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.todayRegistrations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New Registrations Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registered Patients
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {stats.pendingAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled Appointments
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
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Main Dashboard Cards */}
        <Typography variant="h6" gutterBottom>
          Main Functions
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
                  border: card.priority === 'high' ? 2 : 1,
                  borderColor: card.priority === 'high' ? 'primary.main' : 'divider',
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
                  {card.priority === 'high' && (
                    <Chip 
                      label="Priority" 
                      size="small" 
                      color="primary"
                      variant="filled"
                    />
                  )}
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

        {/* Contact Information */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Contact & Support
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<PhoneIcon />} label="IT Support: x1234" variant="outlined" />
            <Chip icon={<PhoneIcon />} label="Admin: x5678" variant="outlined" />
            <Chip label="Front Desk Station" color="info" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
