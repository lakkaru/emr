import * as React from 'react';
import { 
  Container, TextField, Button, Typography, Alert, Box, Card, CardContent, 
  Avatar, Paper, Divider, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon, 
  LocalHospital as HospitalIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { apiClient } from '../utils/api';

export default function SetupPage() {
  const api = apiClient();
  const [hasUsers, setHasUsers] = React.useState(true);
  const [name, setName] = React.useState('');
  const [employeeNumber, setEmployeeNumber] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    api.get('/auth/has-users')
      .then((r) => {
        setHasUsers(r.hasUsers);
        if (r.hasUsers && typeof window !== 'undefined') window.location.href = '/login';
      })
      .catch(() => setHasUsers(true));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (hasUsers) throw new Error('Users already exist. Go to login.');
      const res = await api.post('/auth/register', { 
        name, 
        employeeNumber, 
        username, 
        password, 
        role: 'system_admin' 
      });
      setSuccess('Admin account created successfully! Redirecting to login...');
      setTimeout(() => (window.location.href = '/login'), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Welcome to EMR System Setup',
    'Create Administrator Account',
    'Complete Setup'
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="md">
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <HospitalIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h3" component="h1" gutterBottom color="primary">
                EMR System
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Electronic Medical Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                HIPAA Compliant Healthcare Management
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AdminIcon color="info" />
                <Typography variant="h5" color="info.dark">
                  Initial System Setup
                </Typography>
              </Box>
              <Typography variant="body2" color="info.dark">
                Welcome! This appears to be the first time accessing the EMR system. 
                Please create the initial administrator account with employee credentials.
                All system users are hospital employees with assigned employee numbers and usernames.
              </Typography>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonAddIcon color="primary" />
              Create Administrator Account
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Full Name" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                placeholder="Dr. John Smith"
                helperText="Enter the administrator's full name"
              />
              <TextField 
                label="Employee Number" 
                value={employeeNumber} 
                onChange={e=>setEmployeeNumber(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                placeholder="SYS001"
                helperText="Enter unique employee identification number"
              />
              <TextField 
                label="Username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                placeholder="admin"
                helperText="This will be used for system login (letters, numbers, underscore only)"
                inputProps={{ pattern: '[a-zA-Z0-9_]+' }}
              />
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                helperText="Choose a strong password (minimum 8 characters)"
                inputProps={{ minLength: 8 }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mt: 1 }} icon={<CheckIcon />}>
                  {success}
                </Alert>
              )}

              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                startIcon={<AdminIcon />}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? 'Creating Admin Account...' : 'Create Administrator Account'}
              </Button>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                After setup, you can create additional users and manage the system
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
