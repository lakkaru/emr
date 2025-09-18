import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Paper,
  Stack,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  QrCodeScanner as BarcodeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function BarcodeCheckinPage() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not front desk officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'front_desk')) {
      navigate('/login');
    }
  }, [token, user]);

  const [scannedCode, setScannedCode] = React.useState('');
  const [patient, setPatient] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [checkinDialog, setCheckinDialog] = React.useState(false);

  const handleBarcodeInput = (event) => {
    const code = event.target.value;
    setScannedCode(code);
    
    // Auto-search when barcode is entered (assuming barcode format)
    if (code.length >= 6) { // Minimum patient ID length
      handleSearch(code);
    }
  };

  const handleSearch = async (patientId = scannedCode) => {
    if (!patientId.trim()) {
      setError('Please enter or scan a patient barcode');
      return;
    }

    setLoading(true);
    setError('');
    setPatient(null);

    try {
      // Try to find patient by ID first
      let response;
      try {
        response = await api.get(`/patients/${patientId.trim()}`);
        setPatient(response);
        setSuccess('Patient found! Ready for check-in.');
      } catch (err) {
        // If not found by ID, try searching by barcode/patient number
        const searchResponse = await api.get(`/patients?search=${patientId.trim()}&limit=1`);
        if (searchResponse.items && searchResponse.items.length > 0) {
          setPatient(searchResponse.items[0]);
          setSuccess('Patient found! Ready for check-in.');
        } else {
          setError('Patient not found. Please verify the barcode or patient ID.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to search for patient');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = () => {
    if (!patient) return;
    setCheckinDialog(true);
  };

  const confirmCheckin = () => {
    // TODO: Implement actual check-in logic (update appointment status, create visit record, etc.)
    setSuccess(`${patient.fullName} has been successfully checked in!`);
    setCheckinDialog(false);
    
    // Reset form after successful check-in
    setTimeout(() => {
      setScannedCode('');
      setPatient(null);
      setSuccess('');
    }, 3000);
  };

  const handleManualSearch = () => {
    navigate('/admin/patients');
  };

  if (!user || user.role !== 'front_desk') {
    return null;
  }

  return (
    <Navigation title="Barcode Check-in" currentPath="/checkin/barcode" showBackButton onBack={() => navigate('/front-desk/dashboard')}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <BarcodeIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Patient Barcode Check-in
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scan or enter patient barcode for quick check-in
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

        {/* Barcode Input */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarcodeIcon />
              Scan Barcode
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Patient Barcode / ID"
                placeholder="Scan barcode or enter patient ID"
                value={scannedCode}
                onChange={handleBarcodeInput}
                autoFocus
                helperText="Use barcode scanner or manually enter patient ID"
                InputProps={{
                  sx: { fontSize: '1.2rem', fontFamily: 'monospace' }
                }}
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => handleSearch()}
                  disabled={loading || !scannedCode.trim()}
                  startIcon={<SearchIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleManualSearch}
                  startIcon={<PersonIcon />}
                >
                  Manual Search
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Patient Information */}
        {patient && (
          <Card sx={{ mb: 3, border: 2, borderColor: 'success.main' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CheckIcon color="success" />
                <Typography variant="h6" color="success.main">
                  Patient Found
                </Typography>
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="h6">
                      {patient.fullName}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                      {patient._id}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      NIC
                    </Typography>
                    <Typography variant="body1">
                      {patient.nic || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {patient.phones?.[0]?.number || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCheckin}
                  startIcon={<CheckIcon />}
                  sx={{ minWidth: 200 }}
                >
                  Check In Patient
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Paper sx={{ p: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            How to Use Barcode Check-in
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Use a barcode scanner to scan the patient's barcode ID card
            </Typography>
            <Typography variant="body2">
              • Alternatively, manually enter the patient ID from their card
            </Typography>
            <Typography variant="body2">
              • System will automatically search and display patient information
            </Typography>
            <Typography variant="body2">
              • Click "Check In Patient" to complete the check-in process
            </Typography>
            <Typography variant="body2">
              • Use "Manual Search" if barcode is not available
            </Typography>
          </Stack>
        </Paper>

        {/* Check-in Confirmation Dialog */}
        <Dialog open={checkinDialog} onClose={() => setCheckinDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Patient Check-in</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to check in the following patient?
            </Typography>
            {patient && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6">{patient.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {patient._id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NIC: {patient.nic || 'Not provided'}
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCheckinDialog(false)}>Cancel</Button>
            <Button onClick={confirmCheckin} variant="contained" color="success">
              Confirm Check-in
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Navigation>
  );
}
