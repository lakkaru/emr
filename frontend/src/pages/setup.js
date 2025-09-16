import * as React from 'react';
import { Container, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { apiClient } from '../utils/api';

export default function SetupPage() {
  const api = apiClient();
  const [hasUsers, setHasUsers] = React.useState(true);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
    try {
      if (hasUsers) throw new Error('Users already exist. Go to login.');
      const res = await api.post('/auth/register', { name, email, password, role: 'admin' });
      setSuccess('Admin created. You can now sign in.');
      setTimeout(() => (window.location.href = '/login'), 1000);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Initial Setup</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Create the first admin user.</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Full name" value={name} onChange={e=>setName(e.target.value)} required fullWidth />
        <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required fullWidth />
        <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required fullWidth />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained">Create admin</Button>
      </Box>
    </Container>
  );
}
