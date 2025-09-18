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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Science as LabIcon,
  Assignment as TestIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as PendingIcon,
  PlayArrow as StartIcon,
  Done as CompleteIcon,
  Error as ErrorIcon,
  QrCodeScanner as BarcodeIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

// Test status colors and icons
const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { color: 'warning', icon: <PendingIcon />, label: 'Pending' };
    case 'in_progress':
      return { color: 'info', icon: <StartIcon />, label: 'In Progress' };
    case 'completed':
      return { color: 'success', icon: <CompleteIcon />, label: 'Completed' };
    case 'cancelled':
      return { color: 'error', icon: <ErrorIcon />, label: 'Cancelled' };
    default:
      return { color: 'default', icon: <TestIcon />, label: 'Unknown' };
  }
};

// Priority colors
const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'stat':
      return { color: 'error', label: 'STAT' };
    case 'urgent':
      return { color: 'warning', label: 'Urgent' };
    default:
      return { color: 'default', label: 'Routine' };
  }
};

export default function LabPatientSearch() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not lab officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'lab_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [patients, setPatients] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [labTests, setLabTests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [detailsDialog, setDetailsDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setPatients([]);

    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(searchTerm.trim())}&limit=20`);
      setPatients(response.items || []);
      
      if (response.items?.length === 0) {
        setError('No patients found matching your search');
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    setError('');

    try {
      const labResponse = await api.get(`/lab-tests/patient/${patient._id}`);
      setLabTests(labResponse.tests || []);
      setDetailsDialog(true);
    } catch (err) {
      setError(`Failed to load lab tests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredTests = React.useMemo(() => {
    if (!labTests.length) return [];
    if (tabValue === 0) return labTests; // All tests
    if (tabValue === 1) return labTests.filter(t => t.status === 'pending');
    if (tabValue === 2) return labTests.filter(t => t.status === 'in_progress');
    if (tabValue === 3) return labTests.filter(t => t.status === 'completed');
    return labTests;
  }, [labTests, tabValue]);

  const testCounts = React.useMemo(() => {
    return {
      all: labTests.length,
      pending: labTests.filter(t => t.status === 'pending').length,
      inProgress: labTests.filter(t => t.status === 'in_progress').length,
      completed: labTests.filter(t => t.status === 'completed').length
    };
  }, [labTests]);

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
    <Navigation title="Lab Patient Search" currentPath="/lab/patients" showBackButton onBack={() => navigate('/lab/dashboard')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'info.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <SearchIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Patient Lab Test Search
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search for patients to view their laboratory tests and results
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

        {/* Search Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon />
              Patient Search
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Search Patients"
                placeholder="Enter patient name, NIC, or phone number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Search by patient name, NIC number, or phone number"
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  startIcon={<SearchIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/lab/barcode')}
                  startIcon={<BarcodeIcon />}
                >
                  Barcode Scanner
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Search Results */}
        {patients.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Search Results ({patients.length} patients found)
              </Typography>
              
              <List>
                {patients.map((patient, index) => (
                  <React.Fragment key={patient._id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        py: 2
                      }}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {patient.fullName}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              NIC: {patient.nic}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {patient._id}
                            </Typography>
                            {patient.phones?.[0] && (
                              <Typography variant="body2" color="text.secondary">
                                Phone: {patient.phones[0].number}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      <IconButton 
                        color="primary"
                        sx={{ ml: 2 }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Patient Lab Tests Dialog */}
        <Dialog 
          open={detailsDialog} 
          onClose={() => setDetailsDialog(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { height: '80vh' }
          }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LabIcon />
              <Box>
                <Typography variant="h6">
                  Laboratory Tests - {selectedPatient?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient ID: {selectedPatient?._id} • NIC: {selectedPatient?.nic}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {labTests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LabIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Lab Tests Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No laboratory tests have been ordered for this patient.
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Test Status Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                  <Tab label={`All (${testCounts.all})`} />
                  <Tab label={`Pending (${testCounts.pending})`} />
                  <Tab label={`In Progress (${testCounts.inProgress})`} />
                  <Tab label={`Completed (${testCounts.completed})`} />
                </Tabs>

                {/* Tests Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Code</TableCell>
                        <TableCell>Test Type</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Ordered By</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Results</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTests.map((test) => {
                        const statusConfig = getStatusConfig(test.status);
                        const priorityConfig = getPriorityConfig(test.priority);
                        const isOverdue = new Date(test.dueDate) < new Date() && test.status !== 'completed';

                        return (
                          <TableRow key={test._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {test.testCode}
                              {isOverdue && (
                                <WarningIcon color="error" sx={{ ml: 1, fontSize: 16 }} />
                              )}
                            </TableCell>
                            <TableCell>{test.testType}</TableCell>
                            <TableCell>
                              <Chip 
                                label={priorityConfig.label} 
                                color={priorityConfig.color} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={statusConfig.icon}
                                label={statusConfig.label} 
                                color={statusConfig.color} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {test.orderedBy?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(test.dueDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {test.results ? (
                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {test.results}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No results
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
            {selectedPatient && (
              <Button 
                variant="contained" 
                onClick={() => {
                  setDetailsDialog(false);
                  navigate(`/lab/barcode?patient=${selectedPatient._id}`);
                }}
                startIcon={<BarcodeIcon />}
              >
                Open in Scanner
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Instructions */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            How to Use Patient Search
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Search for patients by name, NIC number, or phone number
            </Typography>
            <Typography variant="body2">
              • Click on a patient to view all their laboratory tests
            </Typography>
            <Typography variant="body2">
              • Use status tabs to filter tests by their current status
            </Typography>
            <Typography variant="body2">
              • Click "Open in Scanner" to process tests with the barcode interface
            </Typography>
            <Typography variant="body2">
              • Use the Barcode Scanner for quick patient lookup by ID
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
