import * as React from 'react';
import { 
  Container, TextField, Button, Typography, Box, Link, Card, CardContent, 
  Alert, Avatar, Paper, Stack, Divider 
} from '@mui/material';
import { LocalHospital as HospitalIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hasUsers, setHasUsers] = React.useState(true);

  React.useEffect(() => {
    const api = apiClient();
    api.get('/auth/has-users').then(r => setHasUsers(r.hasUsers)).catch(()=>setHasUsers(true));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const api = apiClient();
      const res = await api.post('/auth/login', { email, password });
      login(res.token, res.user);
      if (typeof window !== 'undefined') window.location.href = '/';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Card sx={{ maxWidth: 400, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <HospitalIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom color="primary">
                EMR System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Electronic Medical Records
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              Sign In
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                autoComplete="email"
              />
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth 
                variant="outlined"
                autoComplete="current-password"
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}

              <Button 
                variant="contained" 
                type="submit" 
                disabled={loading}
                size="large"
                startIcon={<LoginIcon />}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            {!hasUsers && (
              <Paper sx={{ mt: 3, p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  <strong>First time setup?</strong><br />
                  <Link href="/setup" sx={{ color: 'inherit', textDecoration: 'underline' }}>
                    Create the first admin account
                  </Link>
                </Typography>
              </Paper>
            )}

            {hasUsers && (
              <Paper sx={{ mt: 3, p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  <strong>Need help?</strong><br />
                  Contact your system administrator for account access
                </Typography>
              </Paper>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                HIPAA Compliant Healthcare Management System
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
