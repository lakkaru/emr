import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  Divider,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';

export default function AdminProfilePage() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [editMode, setEditMode] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/auth/profile`, profileForm);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to update profile: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.put(`/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to change password: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setEditMode(false);
    setError('');
  };

  return (
    <Navigation title="Admin Profile" currentPath="/admin/profile">
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 3 }}>
                <AdminIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Admin Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your administrator account settings
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Success/Error Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Profile Information */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon /> Profile Information
                      </Typography>
                      {!editMode && (
                        <IconButton onClick={() => setEditMode(true)} color="primary">
                          <EditIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={3}>
                      <TextField
                        label="Full Name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editMode}
                        fullWidth
                        required
                      />
                      
                      <TextField
                        label="Email Address"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                        fullWidth
                        required
                        type="email"
                      />
                      
                      <TextField
                        label="Role"
                        value={user?.role || 'admin'}
                        disabled
                        fullWidth
                        helperText="Role cannot be changed"
                      />
                    </Stack>

                    {editMode && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          variant="contained"
                          onClick={handleProfileSave}
                          disabled={loading}
                          startIcon={<SaveIcon />}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          startIcon={<CancelIcon />}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Security Settings */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <SecurityIcon /> Security Settings
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setPasswordDialogOpen(true)}
                        startIcon={<SecurityIcon />}
                      >
                        Change Password
                      </Button>
                      
                      <Typography variant="body2" color="text.secondary">
                        Last login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Unknown'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              fullWidth
              required
              helperText="Must be at least 8 characters long"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Navigation>
  );
}
