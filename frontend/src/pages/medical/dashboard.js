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
  LocalHospital as MedicalIcon,
  Assignment as AssignmentIcon,
  Healing as HealingIcon,
  MonitorHeart as VitalsIcon,
  Description as PrescriptionIcon,
  Psychology as DiagnosisIcon,
  Schedule as ScheduleIcon,
  Groups as PatientsIcon,
  Science as LabIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function MedicalOfficerDashboard() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not medical officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'medical_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [stats, setStats] = React.useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingDiagnoses: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const patientsResponse = await api.get('/patients?limit=1');
        
        setStats({
          todayAppointments: 0, // TODO: Implement today's appointments
          totalPatients: patientsResponse.total || 0,
          pendingDiagnoses: 0 // TODO: Implement pending diagnoses
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'medical_officer') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'Patient Records',
      description: 'View and manage patient medical records',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'View Patients',
      path: '/admin/patients',
      priority: 'high'
    },
    {
      title: 'Diagnoses & Treatment',
      description: 'Record diagnoses and treatment plans',
      icon: <DiagnosisIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      action: 'Manage Cases',
      path: '/medical/diagnoses',
      priority: 'high'
    },
    {
      title: 'Prescriptions',
      description: 'Write and manage prescriptions',
      icon: <PrescriptionIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'Prescriptions',
      path: '/medical/prescriptions',
      priority: 'medium'
    },
    {
      title: 'Vital Signs',
      description: 'Monitor patient vital signs',
      icon: <VitalsIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'View Vitals',
      path: '/medical/vitals',
      priority: 'medium'
    },
    {
      title: 'Lab Tests',
      description: 'Order laboratory tests for patients',
      icon: <LabIcon sx={{ fontSize: 40 }} />,
      color: 'secondary',
      action: 'Order Tests',
      path: '/medical/lab-orders',
      priority: 'high'
    }
  ];

  const quickActions = [
    {
      title: 'Emergency Consultation',
      description: 'Handle emergency medical cases',
      icon: <HealingIcon />,
      action: () => navigate('/medical/emergency'),
      color: 'error'
    },
    {
      title: 'Today\'s Schedule',
      description: 'View today\'s appointment schedule',
      icon: <ScheduleIcon />,
      action: () => navigate('/medical/schedule'),
      color: 'info'
    }
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'medical_officer') {
    return null;
  }

  return (
    <Navigation title="Medical Officer Dashboard" currentPath="/medical/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicalIcon color="primary" />
            Medical Officer Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, Dr. {user?.name}. Manage patient care and medical records.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Today's Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.50', border: 1, borderColor: 'success.200' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Today's Medical Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.todayAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Appointments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {stats.pendingDiagnoses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Reviews
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
          Medical Functions
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
                  borderColor: card.priority === 'high' ? 'success.main' : 'divider',
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
                      color="success"
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

        {/* Medical Guidelines */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Medical Guidelines & Resources
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<MedicalIcon />} label="HIPAA Compliant" color="success" />
            <Chip icon={<AssignmentIcon />} label="Evidence-Based Care" color="info" />
            <Chip label="Emergency Protocols Available" variant="outlined" />
            <Chip label={`Logged in as: Dr. ${user?.name}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
