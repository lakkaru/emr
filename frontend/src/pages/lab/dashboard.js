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
  Science as LabIcon,
  Assignment as TestsIcon,
  BugReport as SamplesIcon,
  Assessment as ReportsIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Biotech as BiotechIcon,
  Analytics as AnalyticsIcon,
  QrCodeScanner as BarcodeIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function LabDashboard() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not lab officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'lab_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [stats, setStats] = React.useState({
    pendingTests: 0,
    completedToday: 0,
    totalSamples: 0,
    overdueTests: 0,
    urgentTests: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const statsResponse = await api.get('/lab-tests/stats/dashboard');
        setStats({
          pendingTests: statsResponse.pendingTests || 0,
          completedToday: statsResponse.completedToday || 0,
          totalSamples: statsResponse.totalSamples || 0,
          overdueTests: statsResponse.overdueTests || 0,
          urgentTests: statsResponse.urgentTests || 0
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'lab_officer') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'Barcode Scanner',
      description: 'Scan patient barcodes to access lab tests',
      icon: <BarcodeIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'Scan Barcode',
      path: '/lab/barcode',
      priority: 'high'
    },
    {
      title: 'Lab Tests',
      description: 'Manage and process lab tests',
      icon: <TestsIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'View Tests',
      path: '/lab/tests',
      priority: 'high'
    },
    {
      title: 'Sample Collection',
      description: 'Track sample collection and processing',
      icon: <SamplesIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      action: 'Samples',
      path: '/lab/samples',
      priority: 'high'
    },
    {
      title: 'Test Results',
      description: 'Enter and verify test results',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'Results',
      path: '/lab/results',
      priority: 'medium'
    },
    {
      title: 'Lab Reports',
      description: 'Generate laboratory reports',
      icon: <ReportsIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'Reports',
      path: '/lab/reports',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: 'Barcode Scanner',
      description: 'Scan patient barcode to access lab tests',
      icon: <BarcodeIcon />,
      action: () => navigate('/lab/barcode'),
      color: 'primary'
    },
    {
      title: 'Patient Search',
      description: 'Search patients to view their lab tests',
      icon: <GroupsIcon />,
      action: () => navigate('/lab/patients'),
      color: 'info'
    },
    {
      title: 'Urgent Tests',
      description: 'Process urgent/STAT laboratory tests',
      icon: <BiotechIcon />,
      action: () => navigate('/lab/urgent'),
      color: 'error'
    },
    {
      title: 'Quality Control',
      description: 'Laboratory quality control checks',
      icon: <AnalyticsIcon />,
      action: () => navigate('/lab/qc'),
      color: 'warning'
    }
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'lab_officer') {
    return null;
  }

  return (
    <Navigation title="Laboratory Dashboard" currentPath="/lab/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LabIcon color="primary" />
            Laboratory Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user?.name}. Manage laboratory tests and sample analysis.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Today's Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            Laboratory Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {stats.pendingTests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Tests
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.completedToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h3" color="error.main" fontWeight="bold">
                  {stats.overdueTests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue Tests
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h3" color="info.main" fontWeight="bold">
                  {stats.urgentTests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Urgent Tests
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
          Laboratory Functions
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
                  borderColor: card.priority === 'high' ? 'info.main' : 'divider',
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
                      color="info"
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

        {/* Lab Standards */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Laboratory Standards
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<LabIcon />} label="CLIA Certified" color="info" />
            <Chip icon={<BiotechIcon />} label="Quality Assured" color="success" />
            <Chip label="ISO Standards" variant="outlined" />
            <Chip label={`Lab Officer: ${user?.name}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
