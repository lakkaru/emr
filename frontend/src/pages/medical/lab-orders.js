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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  RadioGroup,
  Radio,
  Autocomplete
} from '@mui/material';
import {
  Science as LabIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Assignment as TestIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

// Available lab test types
const LAB_TEST_TYPES = [
  'Complete Blood Count',
  'Blood Sugar',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Function Test',
  'Urine Analysis',
  'Stool Analysis',
  'X-Ray',
  'ECG',
  'Ultrasound',
  'CT Scan',
  'MRI',
  'Blood Culture',
  'Urine Culture',
  'Sputum Culture',
  'HIV Test',
  'Hepatitis Panel',
  'Pregnancy Test',
  'Allergy Test',
  'Other'
];

// Sample types mapping
const SAMPLE_TYPES = {
  'Complete Blood Count': 'blood',
  'Blood Sugar': 'blood',
  'Lipid Profile': 'blood',
  'Liver Function Test': 'blood',
  'Kidney Function Test': 'blood',
  'Thyroid Function Test': 'blood',
  'Blood Culture': 'blood',
  'HIV Test': 'blood',
  'Hepatitis Panel': 'blood',
  'Urine Analysis': 'urine',
  'Urine Culture': 'urine',
  'Pregnancy Test': 'urine',
  'Stool Analysis': 'stool',
  'Sputum Culture': 'sputum',
  'X-Ray': 'other',
  'ECG': 'other',
  'Ultrasound': 'other',
  'CT Scan': 'other',
  'MRI': 'other',
  'Allergy Test': 'blood',
  'Other': 'other'
};

export default function LabOrdersPage() {
  const { user, token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not medical officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (!token || user?.role !== 'medical_officer')) {
      navigate('/login');
    }
  }, [token, user]);

  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [patients, setPatients] = React.useState([]);
  const [patientSearch, setPatientSearch] = React.useState('');
  const [orderedTests, setOrderedTests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [orderDialog, setOrderDialog] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState(false);

  // New test form state
  const [newTest, setNewTest] = React.useState({
    testType: '',
    priority: 'routine',
    notes: '',
    dueDate: ''
  });

  // Load patients for autocomplete
  React.useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await api.get('/patients?limit=100');
        setPatients(response.items || []);
      } catch (err) {
        console.error('Failed to load patients:', err);
      }
    };

    if (token) {
      loadPatients();
    }
  }, [token, api]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setOrderedTests([]);
    setError('');
    setSuccess('');
  };

  const handleAddTest = () => {
    if (!newTest.testType) {
      setError('Please select a test type');
      return;
    }

    const sampleType = SAMPLE_TYPES[newTest.testType] || 'other';
    
    // Calculate default due date based on priority
    let defaultDueDate = new Date();
    if (newTest.priority === 'stat') {
      defaultDueDate.setDate(defaultDueDate.getDate() + 1);
    } else if (newTest.priority === 'urgent') {
      defaultDueDate.setDate(defaultDueDate.getDate() + 2);
    } else {
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    }

    const test = {
      id: Date.now(), // Temporary ID for frontend
      testType: newTest.testType,
      priority: newTest.priority,
      sampleType: sampleType,
      notes: newTest.notes,
      dueDate: newTest.dueDate || defaultDueDate.toISOString().split('T')[0]
    };

    setOrderedTests(prev => [...prev, test]);
    setNewTest({
      testType: '',
      priority: 'routine',
      notes: '',
      dueDate: ''
    });
    setOrderDialog(false);
    setError('');
  };

  const handleRemoveTest = (testId) => {
    setOrderedTests(prev => prev.filter(t => t.id !== testId));
  };

  const handleSubmitOrders = async () => {
    if (!selectedPatient || orderedTests.length === 0) {
      setError('Please select a patient and add at least one test');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit each test order
      const promises = orderedTests.map(test => 
        api.post('/lab-tests', {
          patientId: selectedPatient._id,
          testType: test.testType,
          priority: test.priority,
          sampleType: test.sampleType,
          notes: test.notes,
          dueDate: test.dueDate
        })
      );

      await Promise.all(promises);
      
      setSuccess(`Successfully ordered ${orderedTests.length} lab test(s) for ${selectedPatient.fullName}`);
      setOrderedTests([]);
      setConfirmDialog(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`Failed to submit lab orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  if (!user || user.role !== 'medical_officer') {
    return null;
  }

  return (
    <Navigation title="Lab Test Orders" currentPath="/medical/lab-orders" showBackButton onBack={() => navigate('/medical/dashboard')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <LabIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Laboratory Test Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Order lab tests for patients and track processing status
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

        {/* Patient Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Select Patient
            </Typography>
            
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => `${option.fullName} (${option.nic || 'No NIC'})`}
              value={selectedPatient}
              onChange={(event, newValue) => handlePatientSelect(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type patient name or NIC"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      NIC: {option.nic || 'Not provided'} • ID: {option._id}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {selectedPatient && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.50', border: 1, borderColor: 'success.200' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  Selected Patient: {selectedPatient.fullName}
                </Typography>
                <Typography variant="body2">
                  NIC: {selectedPatient.nic || 'Not provided'} • 
                  Phone: {selectedPatient.phones?.[0]?.number || 'Not provided'}
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Test Orders */}
        {selectedPatient && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TestIcon />
                  Lab Test Orders ({orderedTests.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOrderDialog(true)}
                  color="secondary"
                >
                  Add Test
                </Button>
              </Box>

              {orderedTests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <TestIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No tests ordered yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click "Add Test" to order laboratory tests for this patient
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Test Type</TableCell>
                          <TableCell>Sample Type</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderedTests.map((test) => {
                          const priorityConfig = getPriorityConfig(test.priority);

                          return (
                            <TableRow key={test.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {test.testType}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={test.sampleType} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={priorityConfig.label} 
                                  color={priorityConfig.color} 
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(test.dueDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 150 }}>
                                  {test.notes || 'No notes'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleRemoveTest(test.id)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={() => setConfirmDialog(true)}
                      disabled={loading}
                      sx={{ minWidth: 200 }}
                    >
                      Submit All Orders
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Test Dialog */}
        <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Lab Test</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={newTest.testType}
                  onChange={(e) => setNewTest(prev => ({ ...prev, testType: e.target.value }))}
                  label="Test Type"
                >
                  {LAB_TEST_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <Typography variant="subtitle1" gutterBottom>Priority</Typography>
                <RadioGroup
                  value={newTest.priority}
                  onChange={(e) => setNewTest(prev => ({ ...prev, priority: e.target.value }))}
                  row
                >
                  <FormControlLabel value="routine" control={<Radio />} label="Routine" />
                  <FormControlLabel value="urgent" control={<Radio />} label="Urgent" />
                  <FormControlLabel value="stat" control={<Radio />} label="STAT" />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={newTest.dueDate}
                onChange={(e) => setNewTest(prev => ({ ...prev, dueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for automatic calculation based on priority"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Clinical Notes"
                value={newTest.notes}
                onChange={(e) => setNewTest(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Clinical indication, patient symptoms, etc."
              />

              {newTest.testType && (
                <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                  <Typography variant="body2">
                    <strong>Sample Type:</strong> {SAMPLE_TYPES[newTest.testType] || 'other'}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTest} variant="contained">Add Test</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Lab Test Orders</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to submit {orderedTests.length} lab test order(s) for:
            </Typography>
            {selectedPatient && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="h6">{selectedPatient.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  NIC: {selectedPatient.nic || 'Not provided'}
                </Typography>
              </Paper>
            )}
            <Typography variant="body2" color="text.secondary">
              Orders will be sent to the laboratory for processing.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitOrders} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Confirm Orders'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Instructions */}
        <Paper sx={{ p: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            Lab Test Ordering Guidelines
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Select the patient first using the search field above
            </Typography>
            <Typography variant="body2">
              • Add multiple tests as needed for comprehensive assessment
            </Typography>
            <Typography variant="body2">
              • Use STAT priority only for emergency cases requiring immediate processing
            </Typography>
            <Typography variant="body2">
              • Include clinical notes to help lab officers prioritize and process tests
            </Typography>
            <Typography variant="body2">
              • All orders will generate test codes that can be scanned by lab officers
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
