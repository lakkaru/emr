import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Avatar,
  Grid,
  Stack,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  VpnKey as ResetPasswordIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { getRoleDisplayName, getRoleOptions, ROLES } from '../../utils/roles';

export default function UserManagementPage() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not system admin
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'system_admin')) {
      window.location.href = '/login';
    }
  }, [token, user]);

  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);
  const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
  const [userToReset, setUserToReset] = React.useState(null);
  
  // Form state
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    role: 'front_desk',
    password: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page + 1}&limit=${rowsPerPage}`);
      setUsers(response.users || []);
      setTotal(response.total || 0);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (token && user?.role === 'system_admin') {
      loadUsers();
    }
  }, [token, user, page, rowsPerPage]);

  const handleOpenDialog = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setForm({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setForm({
        name: '',
        email: '',
        role: 'front_desk',
        password: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    try {
      if (editingUser) {
        // Update existing user
        await api.put(`/users/${editingUser._id}`, {
          name: form.name,
          email: form.email,
          role: form.role
        });
        setSuccess('User updated successfully');
      } else {
        // Create new user
        if (!form.password || form.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
        await api.post('/users', form);
        setSuccess('User created successfully');
      }
      
      handleCloseDialog();
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setSuccess('User deleted successfully');
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (newPassword) => {
    if (!userToReset || !newPassword) return;
    
    try {
      await api.put(`/users/${userToReset._id}/reset-password`, {
        newPassword
      });
      setSuccess('Password reset successfully');
      setResetPasswordOpen(false);
      setUserToReset(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const roleOptions = getRoleOptions().filter(option => option.value !== ROLES.SYSTEM_ADMIN);

  return (
    <Navigation title="User Management" currentPath="/admin/users">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon color="primary" />
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users and their roles
          </Typography>
        </Box>

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

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">System Users</Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add New User
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: userItem.role === 'system_admin' ? 'error.main' : 'primary.main' }}>
                            {userItem.role === 'system_admin' ? <AdminIcon /> : <PersonIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {userItem.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {userItem._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleDisplayName(userItem.role)}
                          color={userItem.role === 'system_admin' ? 'error' : 'primary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {userItem.role !== 'system_admin' && (
                            <>
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(userItem)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reset Password">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setUserToReset(userItem);
                                    setResetPasswordOpen(true);
                                  }}
                                  color="warning"
                                >
                                  <ResetPasswordIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setUserToDelete(userItem);
                                    setDeleteConfirmOpen(true);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {userItem.role === 'system_admin' && (
                            <Chip label="Protected" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit User Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    label="Role"
                  >
                    {roleOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    fullWidth
                    required
                    helperText="Minimum 8 characters"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <PasswordResetDialog
          open={resetPasswordOpen}
          user={userToReset}
          onClose={() => {
            setResetPasswordOpen(false);
            setUserToReset(null);
          }}
          onSubmit={handleResetPassword}
        />
      </Container>
    </Navigation>
  );
}

function PasswordResetDialog({ open, user, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = () => {
    setError('');
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    onSubmit(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password for {user?.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              helperText="Minimum 8 characters"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="warning">
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
