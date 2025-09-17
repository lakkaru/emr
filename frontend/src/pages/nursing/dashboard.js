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
  LocalHospital as NursingIcon,
  Assignment as AssignmentIcon,
  Medication as MedicationIcon,
  MonitorHeart as VitalsIcon,
  People as PatientsIcon,
  Schedule as ScheduleIcon,
  Healing as CareIcon,
  Assessment as ReportsIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';
import { getRoleDisplayName } from '../../utils/roles';

export default function NursingDashboard() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not nursing officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'nursing_officer')) {
      navigate('/login');
    }
  }, [token, user]);

  const [stats, setStats] = React.useState({
    todayPatients: 0,
    totalPatients: 0,
    vitalsRecorded: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const patientsResponse = await api.get('/patients?limit=1');
        
        setStats({
          todayPatients: 0, // TODO: Implement today's count
          totalPatients: patientsResponse.total || 0,
          vitalsRecorded: 0 // TODO: Implement vitals count
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'nursing_officer') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'Patient Care',
      description: 'Monitor and care for patients',
      icon: <CareIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'View Patients',
      path: '/admin/patients',
      priority: 'high'
    },
    {
      title: 'Vital Signs',
      description: 'Record and monitor vital signs',
      icon: <VitalsIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      action: 'Record Vitals',
      path: '/nursing/vitals',
      priority: 'high'
    },
    {
      title: 'Medications',
      description: 'Administer and track medications',
      icon: <MedicationIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'Medications',
      path: '/nursing/medications',
      priority: 'medium'
    },
    {
      title: 'Care Reports',
      description: 'Generate patient care reports',
      icon: <ReportsIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'Reports',
      path: '/nursing/reports',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: 'Emergency Care',
      description: 'Handle emergency nursing care',
      icon: <CareIcon />,
      action: () => navigate('/nursing/emergency'),
      color: 'error'
    },
    {
      title: 'Shift Schedule',
      description: 'View nursing shift schedule',
      icon: <ScheduleIcon />,
      action: () => navigate('/nursing/schedule'),
      color: 'info'
    }
  ];

  if (!user || user.role !== 'nursing_officer') {
    return null;
  }

  return (
    <Navigation title="Nursing Dashboard" currentPath="/nursing/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NursingIcon color="primary" />
            Nursing Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user?.name}. Monitor patient care and nursing activities.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Today's Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Today's Nursing Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.todayPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patients Under Care
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.vitalsRecorded}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vitals Recorded Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="info.main" fontWeight="bold">
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
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
          Nursing Functions
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

        {/* Care Guidelines */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Nursing Care Guidelines
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<NursingIcon />} label="Patient Safety First" color="primary" />
            <Chip icon={<VitalsIcon />} label="Regular Monitoring" color="success" />
            <Chip label="Evidence-Based Practice" variant="outlined" />
            <Chip label={`Logged in as: ${user?.name}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
