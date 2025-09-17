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
  LocalPharmacy as PharmacyIcon,
  Medication as MedicationIcon,
  Inventory as InventoryIcon,
  Receipt as PrescriptionsIcon,
  Schedule as ScheduleIcon,
  Warning as AlertsIcon,
  Assessment as ReportsIcon,
  ShoppingCart as OrdersIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function PharmacyDashboard() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not pharmacy officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'pharmacy_officer')) {
      navigate('/login');
    }
  }, [token, user]);

  const [stats, setStats] = React.useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    lowStockAlerts: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // TODO: Implement pharmacy-specific stats
        setStats({
          pendingPrescriptions: 0,
          dispensedToday: 0,
          lowStockAlerts: 0
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'pharmacy_officer') {
      loadDashboardStats();
    }
  }, [token, user, api]);

  const dashboardCards = [
    {
      title: 'Prescriptions',
      description: 'Process and dispense prescriptions',
      icon: <PrescriptionsIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      action: 'View Prescriptions',
      path: '/pharmacy/prescriptions',
      priority: 'high'
    },
    {
      title: 'Medication Inventory',
      description: 'Manage medication stock and inventory',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      action: 'Inventory',
      path: '/pharmacy/inventory',
      priority: 'high'
    },
    {
      title: 'Drug Orders',
      description: 'Place and track drug orders',
      icon: <OrdersIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      action: 'Orders',
      path: '/pharmacy/orders',
      priority: 'medium'
    },
    {
      title: 'Pharmacy Reports',
      description: 'Generate pharmacy reports and analytics',
      icon: <ReportsIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      action: 'Reports',
      path: '/pharmacy/reports',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: 'Emergency Meds',
      description: 'Dispense emergency medications',
      icon: <MedicationIcon />,
      action: () => navigate('/pharmacy/emergency'),
      color: 'error'
    },
    {
      title: 'Stock Alerts',
      description: 'Review low stock alerts',
      icon: <AlertsIcon />,
      action: () => navigate('/pharmacy/alerts'),
      color: 'warning'
    }
  ];

  if (!user || user.role !== 'pharmacy_officer') {
    return null;
  }

  return (
    <Navigation title="Pharmacy Dashboard" currentPath="/pharmacy/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PharmacyIcon color="primary" />
            Pharmacy Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user?.name}. Manage pharmacy operations and medication dispensing.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Today's Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.50', border: 1, borderColor: 'warning.200' }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            Pharmacy Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="error.main" fontWeight="bold">
                  {stats.pendingPrescriptions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Prescriptions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.dispensedToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dispensed Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {stats.lowStockAlerts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Stock Alerts
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
          Pharmacy Functions
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
                  borderColor: card.priority === 'high' ? 'warning.main' : 'divider',
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
                      color="warning"
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

        {/* Pharmacy Standards */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Pharmacy Standards & Compliance
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<PharmacyIcon />} label="DEA Licensed" color="warning" />
            <Chip icon={<MedicationIcon />} label="Controlled Substances" color="error" />
            <Chip label="FDA Compliant" variant="outlined" />
            <Chip label={`Pharmacist: ${user?.name}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
