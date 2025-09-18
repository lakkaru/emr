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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  QrCodeScanner as BarcodeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  Science as LabIcon,
  Assignment as TestIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  Done as CompleteIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

// Common medical tests for dropdown
const COMMON_TESTS = [
  'Complete Blood Count (CBC)',
  'Comprehensive Metabolic Panel',
  'Lipid Panel',
  'Thyroid Function Tests',
  'Liver Function Tests',
  'Kidney Function Tests',
  'Blood Glucose',
  'HbA1c',
  'ESR',
  'CRP',
  'Urine Analysis',
  'Stool Analysis',
  'X-Ray Chest',
  'ECG',
  'Echocardiogram',
  'Ultrasound Abdomen',
  'CT Scan',
  'MRI',
  'Blood Culture',
  'Urine Culture'
];

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

export default function LabBarcodeScanner() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not lab officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'lab_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [scannedCode, setScannedCode] = React.useState('');
  const [patient, setPatient] = React.useState(null);
  const [labTests, setLabTests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [selectedTest, setSelectedTest] = React.useState(null);
  const [testDialog, setTestDialog] = React.useState(false);
  const [addTestDialog, setAddTestDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  
  // New test form state
  const [newTestForm, setNewTestForm] = React.useState({
    testType: '',
    priority: 'routine',
    sampleType: 'blood',
    externalDoctorName: '',
    externalInstitute: '',
    notes: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  });

  // Check for patient parameter in URL on component mount
  React.useEffect(() => {
    const loadPatientFromURL = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patient');
        if (patientId) {
          setScannedCode(patientId);
          await handleSearch(patientId);
        }
      }
    };

    if (token && user?.role === 'lab_officer') {
      loadPatientFromURL();
    }
  }, [token, user]);

  const handleBarcodeInput = (event) => {
    const code = event.target.value;
    setScannedCode(code);
    
    // Auto-search when barcode is entered (assuming patient ID format)
    if (code.length >= 6) {
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
    setLabTests([]);

    try {
      // Search for patient and their lab tests
      const patientResponse = await api.get(`/patients/${patientId.trim()}`);
      const labResponse = await api.get(`/lab-tests/patient/${patientId.trim()}`);
      
      setPatient(patientResponse);
      setLabTests(labResponse.tests || []);
      setSuccess(`Found ${labResponse.tests?.length || 0} lab tests for ${patientResponse.fullName}`);
    } catch (err) {
      // Try searching by patient barcode if direct ID search fails
      try {
        const searchResponse = await api.get(`/patients?search=${patientId.trim()}&limit=1`);
        if (searchResponse.items && searchResponse.items.length > 0) {
          const foundPatient = searchResponse.items[0];
          const labResponse = await api.get(`/lab-tests/patient/${foundPatient._id}`);
          
          setPatient(foundPatient);
          setLabTests(labResponse.tests || []);
          setSuccess(`Found ${labResponse.tests?.length || 0} lab tests for ${foundPatient.fullName}`);
        } else {
          setError('Patient not found. Please verify the barcode or patient ID.');
        }
      } catch (searchErr) {
        setError('Patient not found or error accessing lab tests.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestAction = (test, action) => {
    setSelectedTest({ ...test, action });
    setTestDialog(true);
  };

  const handleTestUpdate = async (updates) => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      await api.put(`/lab-tests/${selectedTest._id}`, updates);
      setSuccess('Test updated successfully!');
      setTestDialog(false);
      
      // Refresh the lab tests
      await handleSearch(patient._id);
    } catch (err) {
      setError(`Failed to update test: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTestFormChange = (field, value) => {
    setNewTestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewTestSubmit = async () => {
    if (!patient || !newTestForm.testType || !newTestForm.externalDoctorName || !newTestForm.externalInstitute) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const testData = {
        patientId: patient._id,
        testType: newTestForm.testType,
        priority: newTestForm.priority,
        sampleType: newTestForm.sampleType,
        externalDoctorName: newTestForm.externalDoctorName,
        externalInstitute: newTestForm.externalInstitute,
        notes: newTestForm.notes,
        dueDate: newTestForm.dueDate,
        status: 'pending'
      };

      console.log('Submitting test data:', testData);
      const response = await api.post('/lab-tests', testData);
      console.log('Test creation response:', response);
      setSuccess('New test added successfully!');
      setAddTestDialog(false);
      
      // Reset form
      setNewTestForm({
        testType: '',
        priority: 'routine',
        sampleType: 'blood',
        externalDoctorName: '',
        externalInstitute: '',
        notes: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      // Refresh the lab tests
      await handleSearch(patient._id);
    } catch (err) {
      console.error('Error creating test:', err);
      setError(`Failed to add new test: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = React.useMemo(() => {
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
    <Navigation title="Lab Barcode Scanner" currentPath="/lab/barcode" showBackButton onBack={() => navigate('/lab/dashboard')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'info.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <BarcodeIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Lab Test Scanner
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scan patient barcode to view lab tests and enter results
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
              Patient Barcode Scanner
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Patient Barcode / ID"
                placeholder="Scan patient barcode or enter patient ID"
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
                  onClick={() => navigate('/lab/patients')}
                  startIcon={<PersonIcon />}
                >
                  Patient Search
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Patient Information & Lab Tests */}
        {patient && (
          <Box>
            {/* Patient Info Card */}
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
                        Lab Tests
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={`${testCounts.pending} Pending`} 
                          color="warning" 
                          size="small"
                        />
                        <Chip 
                          label={`${testCounts.completed} Completed`} 
                          color="success" 
                          size="small"
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Lab Tests */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LabIcon />
                    Laboratory Tests
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<TestIcon />}
                    onClick={() => setAddTestDialog(true)}
                    size="small"
                  >
                    Add New Test
                  </Button>
                </Box>

                {/* Test Status Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                  <Tab label={`All (${testCounts.all})`} />
                  <Tab label={`Pending (${testCounts.pending})`} />
                  <Tab label={`In Progress (${testCounts.inProgress})`} />
                  <Tab label={`Completed (${testCounts.completed})`} />
                </Tabs>

                {filteredTests.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <LabIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No lab tests found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tabValue === 0 ? 'No tests ordered for this patient' : 'No tests in this status'}
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Test Code</TableCell>
                          <TableCell>Test Type</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Ordered By</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Actions</TableCell>
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
                                  <Tooltip title="Overdue">
                                    <WarningIcon color="error" sx={{ ml: 1, fontSize: 16 }} />
                                  </Tooltip>
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
                                <Stack direction="row" spacing={1}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTestAction(test, 'view')}
                                    color="info"
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                  {test.status === 'pending' && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleTestAction(test, 'start')}
                                      color="primary"
                                    >
                                      <StartIcon />
                                    </IconButton>
                                  )}
                                  {test.status === 'in_progress' && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleTestAction(test, 'edit')}
                                      color="warning"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Test Action Dialog */}
        <TestActionDialog
          open={testDialog}
          onClose={() => setTestDialog(false)}
          test={selectedTest}
          onUpdate={handleTestUpdate}
        />

        {/* Instructions */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            How to Use Lab Scanner
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Scan patient barcode to view all lab tests ordered for the patient
            </Typography>
            <Typography variant="body2">
              • Click "Start" to begin processing a pending test
            </Typography>
            <Typography variant="body2">
              • Use "Edit" to enter results and complete tests in progress
            </Typography>
            <Typography variant="body2">
              • View completed tests and generate reports as needed
            </Typography>
          </Stack>
        </Paper>

        {/* Add New Test Dialog */}
        <Dialog 
          open={addTestDialog} 
          onClose={() => setAddTestDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Add New External Test
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Test Type *</InputLabel>
                  <Select
                    value={newTestForm.testType}
                    onChange={(e) => handleNewTestFormChange('testType', e.target.value)}
                    label="Test Type *"
                  >
                    {COMMON_TESTS.map((test) => (
                      <MenuItem key={test} value={test}>
                        {test}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTestForm.priority}
                    onChange={(e) => handleNewTestFormChange('priority', e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="routine">Routine</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="stat">STAT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="External Doctor Name *"
                  value={newTestForm.externalDoctorName}
                  onChange={(e) => handleNewTestFormChange('externalDoctorName', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="External Institute *"
                  value={newTestForm.externalInstitute}
                  onChange={(e) => handleNewTestFormChange('externalInstitute', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sample Type</InputLabel>
                  <Select
                    value={newTestForm.sampleType}
                    onChange={(e) => handleNewTestFormChange('sampleType', e.target.value)}
                    label="Sample Type"
                  >
                    <MenuItem value="blood">Blood</MenuItem>
                    <MenuItem value="urine">Urine</MenuItem>
                    <MenuItem value="stool">Stool</MenuItem>
                    <MenuItem value="saliva">Saliva</MenuItem>
                    <MenuItem value="tissue">Tissue</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  value={newTestForm.dueDate.toISOString().split('T')[0]}
                  onChange={(e) => handleNewTestFormChange('dueDate', new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={newTestForm.notes}
                  onChange={(e) => handleNewTestFormChange('notes', e.target.value)}
                  placeholder="Additional notes or special instructions..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddTestDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleNewTestSubmit}
              variant="contained"
              disabled={!newTestForm.testType || !newTestForm.externalDoctorName || !newTestForm.externalInstitute}
            >
              Add Test
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Navigation>
  );
}

// Test Action Dialog Component
function TestActionDialog({ open, onClose, test, onUpdate }) {
  const [results, setResults] = React.useState('');
  const [interpretation, setInterpretation] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [normalRange, setNormalRange] = React.useState('');

  React.useEffect(() => {
    if (test) {
      setResults(test.results || '');
      setInterpretation(test.interpretation || '');
      setNotes(test.notes || '');
      setNormalRange(test.normalRange || '');
    }
  }, [test]);

  const handleSubmit = () => {
    if (!test) return;

    const updates = {
      results,
      interpretation,
      notes,
      normalRange
    };

    if (test.action === 'start') {
      updates.status = 'in_progress';
      updates.sampleCollected = true;
    } else if (test.action === 'edit' && results.trim()) {
      updates.status = 'completed';
    }

    onUpdate(updates);
  };

  if (!test) return null;

  const isViewOnly = test.action === 'view';
  const statusConfig = getStatusConfig(test.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <LabIcon />
          <Box>
            <Typography variant="h6">
              {test.testType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Code: {test.testCode} • Status: {statusConfig.label}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Test Information */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>Test Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Sample Type</Typography>
                <Typography variant="body1">{test.sampleType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Priority</Typography>
                <Chip 
                  label={getPriorityConfig(test.priority).label} 
                  color={getPriorityConfig(test.priority).color} 
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Ordered By</Typography>
                <Typography variant="body1">{test.orderedBy?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Due Date</Typography>
                <Typography variant="body1">
                  {new Date(test.dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Entry */}
          <TextField
            fullWidth
            label="Test Results"
            multiline
            rows={3}
            value={results}
            onChange={(e) => setResults(e.target.value)}
            disabled={isViewOnly}
            placeholder="Enter test results, measurements, and observations"
          />

          <TextField
            fullWidth
            label="Normal Range"
            value={normalRange}
            onChange={(e) => setNormalRange(e.target.value)}
            disabled={isViewOnly}
            placeholder="e.g., 70-110 mg/dL"
          />

          <TextField
            fullWidth
            label="Interpretation"
            multiline
            rows={2}
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
            disabled={isViewOnly}
            placeholder="Clinical interpretation of results"
          />

          <TextField
            fullWidth
            label="Additional Notes"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isViewOnly}
            placeholder="Any additional observations or notes"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isViewOnly ? 'Close' : 'Cancel'}
        </Button>
        {!isViewOnly && (
          <Button onClick={handleSubmit} variant="contained">
            {test.action === 'start' ? 'Start Test' : 'Update Results'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
