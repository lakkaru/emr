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
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  QrCodeScanner as BarcodeIcon,
  Science as LabIcon,
  Assignment as TestIcon,
  Warning as WarningIcon,
  PlayArrow as StartIcon,
  Done as CompleteIcon,
  AccessTime as PendingIcon,
  LocalPharmacy as PharmacyIcon,
  Add as AddIcon,
  Medication as MedicationIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import VoiceInput from '../../components/VoiceInput';
import CameraCapture from '../../components/CameraCapture';
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

// Common medications for dropdown
const COMMON_MEDICATIONS = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 500mg',
  'Omeprazole 20mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Atorvastatin 20mg',
  'Aspirin 75mg',
  'Losartan 50mg',
  'Levothyroxine 50mcg',
  'Furosemide 40mg',
  'Prednisolone 5mg',
  'Salbutamol Inhaler',
  'Insulin Regular',
  'Multivitamin'
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
      return { color: 'error', icon: <WarningIcon />, label: 'Cancelled' };
    default:
      return { color: 'default', icon: <TestIcon />, label: 'Unknown' };
  }
};

export default function MedicalPatientSearch() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not medical officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'medical_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [patients, setPatients] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [labTests, setLabTests] = React.useState([]);
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [tabValue, setTabValue] = React.useState(0);
  
  // Dialog states
  const [prescriptionDialog, setPrescriptionDialog] = React.useState(false);
  const [labTestDialog, setLabTestDialog] = React.useState(false);
  
  const [prescriptionForm, setPrescriptionForm] = React.useState({
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],
    generalInstructions: ''
  });
  
  const [recentMedications, setRecentMedications] = React.useState([]);
  const [capturedImages, setCapturedImages] = React.useState([]);
  const [imageViewDialog, setImageViewDialog] = React.useState({ open: false, src: '', title: '' });
  
  const [labTestForm, setLabTestForm] = React.useState({
    testType: '',
    priority: 'routine',
    sampleType: 'blood',
    notes: ''
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setPatients([]);
    setSelectedPatient(null);
    setLabTests([]);

    try {
      // Search for patients
      const response = await api.get(`/patients?search=${encodeURIComponent(searchTerm.trim())}&limit=10`);
      
      if (response.items && response.items.length > 0) {
        setPatients(response.items);
        setSuccess(`Found ${response.items.length} patient(s)`);
      } else {
        setError('No patients found matching your search criteria');
      }
    } catch (err) {
      setError('Error searching for patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    setError('');
    
    try {
      // Get patient's lab tests and prescriptions
      const [labResponse, prescriptionResponse] = await Promise.all([
        api.get(`/lab-tests/patient/${patient._id}`),
        api.get(`/prescriptions/patient/${patient._id}`)
      ]);
      
      setLabTests(labResponse.tests || []);
      setPrescriptions(prescriptionResponse.prescriptions || []);
    } catch (err) {
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };



  // Prescription form handlers
  const handlePrescriptionSubmit = async () => {
    // Validate that at least one medication is properly filled
    const validMedications = prescriptionForm.medications.filter(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (!selectedPatient || validMedications.length === 0) {
      setError('Please fill in all required details for at least one medication');
      return;
    }

    setLoading(true);
    try {
      // Create FormData to handle both text and image data
      const formData = new FormData();
      formData.append('patientId', selectedPatient._id);
      formData.append('medications', JSON.stringify(validMedications));
      formData.append('generalInstructions', prescriptionForm.generalInstructions);
      
      // Add captured images to FormData
      capturedImages.forEach((image, index) => {
        formData.append('images', image.blob, `prescription-image-${index + 1}.jpg`);
      });

      await api.post('/prescriptions', formData);
      setSuccess('Prescription created successfully!');
      setPrescriptionDialog(false);
      setPrescriptionForm({ 
        medications: [{
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }],
        generalInstructions: ''
      });
      
      // Clear captured images and clean up object URLs
      capturedImages.forEach(img => {
        URL.revokeObjectURL(img.url);
      });
      setCapturedImages([]);
      
      // Refresh prescriptions list
      const prescriptionResponse = await api.get(`/prescriptions/patient/${selectedPatient._id}`);
      setPrescriptions(prescriptionResponse.prescriptions || []);
    } catch (err) {
      setError(`Failed to create prescription: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Medication management handlers
  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Load recent medications for quick access
  const loadRecentMedications = React.useCallback(() => {
    if (!selectedPatient || !prescriptions || prescriptions.length === 0) {
      setRecentMedications([]);
      return;
    }

    // Extract unique medications from recent prescriptions (last 10 prescriptions)
    const allMedications = [];
    const recentPrescriptions = prescriptions.slice(0, 10);
    
    recentPrescriptions.forEach(prescription => {
      // Handle new format (medications array)
      if (prescription.medications && Array.isArray(prescription.medications)) {
        prescription.medications.forEach(med => {
          // Check if this medication combination already exists
          const exists = allMedications.find(existing => 
            existing.name === med.name && 
            existing.dosage === med.dosage && 
            existing.frequency === med.frequency
          );
          
          if (!exists) {
            allMedications.push({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions,
              count: 1
            });
          } else {
            exists.count++;
          }
        });
      }
      // Handle old format (single medication) for backward compatibility
      else if (prescription.medication) {
        const exists = allMedications.find(existing => 
          existing.name === prescription.medication && 
          existing.dosage === prescription.dosage && 
          existing.frequency === prescription.frequency
        );
        
        if (!exists) {
          allMedications.push({
            name: prescription.medication,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration,
            instructions: prescription.instructions || '',
            count: 1
          });
        } else {
          exists.count++;
        }
      }
    });

    // If no recent medications, add some commonly prescribed ones
    if (allMedications.length === 0) {
      const commonMedications = [
        { name: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'For fever and pain', count: 0 },
        { name: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: '3 times daily', duration: '7 days', instructions: 'Take with food', count: 0 },
        { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: '3 times daily', duration: '3 days', instructions: 'Take with food', count: 0 },
        { name: 'Omeprazole 20mg', dosage: '1 tablet', frequency: 'Once daily', duration: '14 days', instructions: 'Take before breakfast', count: 0 },
        { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days', instructions: 'For allergies', count: 0 },
        { name: 'Vitamin D3 1000IU', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food', count: 0 }
      ];
      setRecentMedications(commonMedications.slice(0, 6));
    } else {
      // Sort by frequency of use (most used first) and limit to top 8
      const sortedMedications = allMedications
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setRecentMedications(sortedMedications);
    }
  }, [selectedPatient, prescriptions]);

  // Quick-select medication
  const quickSelectMedication = (medication) => {
    // Find the first empty medication slot or add a new one
    const emptyIndex = prescriptionForm.medications.findIndex(med => !med.name);
    
    if (emptyIndex !== -1) {
      // Fill empty slot
      updateMedication(emptyIndex, 'name', medication.name);
      updateMedication(emptyIndex, 'dosage', medication.dosage);
      updateMedication(emptyIndex, 'frequency', medication.frequency);
      updateMedication(emptyIndex, 'duration', medication.duration);
      updateMedication(emptyIndex, 'instructions', medication.instructions);
    } else {
      // Add new medication
      setPrescriptionForm(prev => ({
        ...prev,
        medications: [
          ...prev.medications,
          {
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            duration: medication.duration,
            instructions: medication.instructions
          }
        ]
      }));
    }
  };

  const handleImageCapture = (images) => {
    setCapturedImages(images);
  };

  // Load recent medications when prescriptions change or dialog opens
  React.useEffect(() => {
    if (prescriptionDialog) {
      loadRecentMedications();
    }
  }, [prescriptionDialog, loadRecentMedications]);

  // Lab test form handlers
  const handleLabTestSubmit = async () => {
    if (!selectedPatient || !labTestForm.testType) {
      setError('Please select a test type');
      return;
    }

    setLoading(true);
    try {
      const testData = {
        patientId: selectedPatient._id,
        testType: labTestForm.testType,
        priority: labTestForm.priority,
        sampleType: labTestForm.sampleType,
        notes: labTestForm.notes,
        status: 'pending'
      };

      await api.post('/lab-tests', testData);
      setSuccess('Lab test ordered successfully!');
      setLabTestDialog(false);
      setLabTestForm({ testType: '', priority: 'routine', sampleType: 'blood', notes: '' });
      
      // Refresh lab tests
      const labResponse = await api.get(`/lab-tests/patient/${selectedPatient._id}`);
      setLabTests(labResponse.tests || []);
    } catch (err) {
      setError('Failed to order lab test');
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

  if (!user || user.role !== 'medical_officer') {
    return null;
  }

  return (
    <Navigation title="Medical Patient Search" currentPath="/medical/patients" showBackButton onBack={() => navigate('/medical/dashboard')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <SearchIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Patient Search & Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search patients and manage diagnoses, prescriptions, and lab tests
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
              <BarcodeIcon />
              Patient Search
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Patient Barcode / ID / Name / NIC"
                placeholder="Scan patient barcode or search by name/NIC"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {loading ? 'Searching...' : 'Search Patients'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Search Results */}
        {patients.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Results ({patients.length} found)
              </Typography>
              <List>
                {patients.map((patient, index) => (
                  <React.Fragment key={patient._id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: selectedPatient?._id === patient._id ? 'action.selected' : 'transparent'
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{patient.fullName}</Typography>
                            <Chip 
                              label={patient.gender} 
                              size="small" 
                              color={patient.gender === 'male' ? 'primary' : 'secondary'} 
                            />
                          </Box>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              <strong>NIC:</strong> {patient.nic}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Age:</strong> {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phone:</strong> {patient.phones?.[0]?.number || 'N/A'}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < patients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Selected Patient Details */}
        {selectedPatient && (
          <Box sx={{ mb: 3 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Selected Patient: {selectedPatient.fullName}
                </Typography>
                
                {/* Quick Actions */}
                <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PharmacyIcon />}
                    onClick={() => setPrescriptionDialog(true)}
                    color="primary"
                    size="large"
                  >
                    Prescribe Medicine
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<LabIcon />}
                    onClick={() => setLabTestDialog(true)}
                    color="secondary"
                    size="large"
                  >
                    Order Lab Test
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Prescriptions Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicationIcon />
                    Prescriptions
                  </Typography>
                </Box>

                {prescriptions.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {prescriptions.map((prescription) => (
                      <Card key={prescription._id} sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 2 }}>
                          {/* Header Section */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
                                <PharmacyIcon fontSize="small" />
                                {prescription.prescriptionNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Prescribed by: {prescription.doctor?.name || 'Unknown Doctor'}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip
                                label={prescription.status.toUpperCase()}
                                size="small"
                                color={
                                  prescription.status === 'active' ? 'success' :
                                  prescription.status === 'completed' ? 'primary' :
                                  prescription.status === 'cancelled' ? 'error' :
                                  'default'
                                }
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary" display="block">
                                Prescribed: {new Date(prescription.createdAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="error" display="block">
                                Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Medications Section */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                              Medications ({prescription.medications?.length || 1}):
                            </Typography>
                            <Grid container spacing={1}>
                              {prescription.medications ? (
                                prescription.medications.map((med, index) => (
                                  <Grid item xs={12} md={6} key={index}>
                                    <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                      <Typography variant="body2" fontWeight="bold" color="primary">
                                        {index + 1}. {med.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        <strong>Dosage:</strong> {med.dosage}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        <strong>Frequency:</strong> {med.frequency}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        <strong>Duration:</strong> {med.duration}
                                      </Typography>
                                      {med.instructions && (
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                          <strong>Notes:</strong> {med.instructions}
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>
                                ))
                              ) : (
                                // Backward compatibility for old single medication format
                                <Grid item xs={12} md={6}>
                                  <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                      1. {prescription.medication}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      <strong>Dosage:</strong> {prescription.dosage}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      <strong>Frequency:</strong> {prescription.frequency}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      <strong>Duration:</strong> {prescription.duration}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>
                          </Box>

                          {/* General Instructions */}
                          {(prescription.generalInstructions || prescription.instructions) && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                                General Instructions:
                              </Typography>
                              <Paper sx={{ p: 1.5, bgcolor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {prescription.generalInstructions || prescription.instructions}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {/* Attachments Section */}
                          {prescription.attachments && prescription.attachments.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                                Attachments ({prescription.attachments.length}):
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {prescription.attachments.map((attachment, index) => (
                                  <Paper 
                                    key={index} 
                                    sx={{ 
                                      p: 1, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1,
                                      bgcolor: '#e3f2fd',
                                      border: '1px solid #bbdefb'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #ddd'
                                      }}
                                    >
                                      {attachment.mimetype?.startsWith('image/') ? (
                                        <img
                                          src={`/api/prescriptions/${prescription._id}/attachments/${index}`}
                                          alt={attachment.filename}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                            cursor: 'pointer'
                                          }}
                                          onClick={() => setImageViewDialog({
                                            open: true,
                                            src: `/api/prescriptions/${prescription._id}/attachments/${index}`,
                                            title: `${attachment.filename} - ${prescription.prescriptionNumber}`
                                          })}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                          }}
                                        />
                                      ) : null}
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ display: attachment.mimetype?.startsWith('image/') ? 'none' : 'block' }}
                                      >
                                        IMG
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" display="block" fontWeight="medium">
                                        {attachment.filename || `Image ${index + 1}`}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString() : 'Unknown date'}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No prescriptions found for this patient
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Lab Tests Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TestIcon />
                    Laboratory Tests
                  </Typography>
                </Box>

                {/* Test Status Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                  <Tab label={`All (${testCounts.all})`} />
                  <Tab label={`Pending (${testCounts.pending})`} />
                  <Tab label={`In Progress (${testCounts.inProgress})`} />
                  <Tab label={`Completed (${testCounts.completed})`} />
                </Tabs>

                {filteredTests.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Test Code</TableCell>
                          <TableCell>Test Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Ordered Date</TableCell>
                          <TableCell>Due Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTests.map((test) => {
                          const statusConfig = getStatusConfig(test.status);
                          return (
                            <TableRow key={test._id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {test.testCode}
                                </Typography>
                              </TableCell>
                              <TableCell>{test.testType}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={statusConfig.icon}
                                  label={statusConfig.label}
                                  color={statusConfig.color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={test.priority} 
                                  size="small" 
                                  color={test.priority === 'stat' ? 'error' : test.priority === 'urgent' ? 'warning' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(test.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {new Date(test.dueDate).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No {tabValue > 0 ? ['', 'pending', 'in progress', 'completed'][tabValue] + ' ' : ''}lab tests found for this patient
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}



        {/* Prescription Dialog */}
        <Dialog open={prescriptionDialog} onClose={() => setPrescriptionDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Prescribe Medicine
              <Button
                startIcon={<AddIcon />}
                onClick={addMedication}
                variant="outlined"
                size="small"
              >
                Add Medication
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {/* Quick Select Recent Medications */}
            {recentMedications.length > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  {recentMedications.some(med => med.count > 0) 
                    ? 'Recently Prescribed Medications (Click to add)' 
                    : 'Commonly Prescribed Medications (Click to add)'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {recentMedications.map((medication, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => quickSelectMedication(medication)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        border: '1px solid #e0e0e0',
                        bgcolor: 'white',
                        '&:hover': {
                          bgcolor: '#e3f2fd',
                          borderColor: '#1976d2'
                        }
                      }}
                    >
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {medication.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medication.dosage} • {medication.frequency}
                        </Typography>
                        {medication.count > 1 && (
                          <Typography variant="caption" sx={{ ml: 1, color: '#4caf50', fontWeight: 'bold' }}>
                            ({medication.count}x used)
                          </Typography>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {recentMedications.some(med => med.count > 0) 
                    ? '* These are the most commonly prescribed medications for this patient' 
                    : '* These are commonly prescribed medications to help you get started'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              {prescriptionForm.medications.map((medication, index) => (
                <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      Medication {index + 1}
                    </Typography>
                    {prescriptionForm.medications.length > 1 && (
                      <IconButton
                        onClick={() => removeMedication(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Medication *</InputLabel>
                        <Select
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          label="Medication *"
                        >
                          {COMMON_MEDICATIONS.map((med) => (
                            <MenuItem key={med} value={med}>
                              {med}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Dosage *"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 1 tablet, 5ml"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Frequency *"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily, Every 8 hours"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Duration *"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days, 2 weeks"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Special Instructions for this medication"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food, Take on empty stomach"
                        />
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <VoiceInput
                            onTranscript={(text) => updateMedication(index, 'instructions', medication.instructions + ' ' + text)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              
              {/* General Instructions */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="General Instructions"
                    value={prescriptionForm.generalInstructions}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, generalInstructions: e.target.value }))}
                    placeholder="General instructions for the entire prescription (e.g., Avoid alcohol, Complete the full course)"
                  />
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <VoiceInput
                      onTranscript={(text) => setPrescriptionForm(prev => ({ 
                        ...prev, 
                        generalInstructions: prev.generalInstructions + ' ' + text 
                      }))}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Image Capture for Documentation */}
              <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                  Documentation & Sketches
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <CameraCapture
                    onCapture={handleImageCapture}
                    maxImages={5}
                  />
                  {capturedImages.length > 0 && (
                    <Typography variant="body2" color="primary">
                      {capturedImages.length} image{capturedImages.length !== 1 ? 's' : ''} captured
                    </Typography>
                  )}
                </Box>
                {capturedImages.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {capturedImages.map((image, index) => (
                      <Box
                        key={image.id}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid #ddd'
                        }}
                      >
                        <img
                          src={image.url}
                          alt={`Captured ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPrescriptionDialog(false)}>Cancel</Button>
            <Button 
              onClick={handlePrescriptionSubmit} 
              variant="contained" 
              disabled={prescriptionForm.medications.every(med => !med.name || !med.dosage || !med.frequency || !med.duration)}
            >
              Create Prescription
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lab Test Dialog */}
        <Dialog open={labTestDialog} onClose={() => setLabTestDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Order Lab Test</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Test Type *</InputLabel>
                  <Select
                    value={labTestForm.testType}
                    onChange={(e) => setLabTestForm(prev => ({ ...prev, testType: e.target.value }))}
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
                    value={labTestForm.priority}
                    onChange={(e) => setLabTestForm(prev => ({ ...prev, priority: e.target.value }))}
                    label="Priority"
                  >
                    <MenuItem value="routine">Routine</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="stat">STAT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sample Type</InputLabel>
                  <Select
                    value={labTestForm.sampleType}
                    onChange={(e) => setLabTestForm(prev => ({ ...prev, sampleType: e.target.value }))}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Clinical Notes"
                  value={labTestForm.notes}
                  onChange={(e) => setLabTestForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Clinical indication, special instructions..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLabTestDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleLabTestSubmit} 
              variant="contained" 
              disabled={!labTestForm.testType}
            >
              Order Test
            </Button>
          </DialogActions>
        </Dialog>

        {/* Instructions */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            How to Use Medical Patient Search
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Search patients by barcode, name, or NIC number
            </Typography>
            <Typography variant="body2">
              • Select a patient to view their lab tests and medical history
            </Typography>
            <Typography variant="body2">
              • Add diagnoses and treatment plans for the selected patient
            </Typography>
            <Typography variant="body2">
              • Prescribe medications with detailed dosage instructions
            </Typography>
            <Typography variant="body2">
              • Order laboratory tests as needed for diagnosis
            </Typography>
          </Stack>
        </Paper>
      </Container>

      {/* Image Viewer Dialog */}
      <Dialog 
        open={imageViewDialog.open} 
        onClose={() => setImageViewDialog({ open: false, src: '', title: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {imageViewDialog.title}
            <IconButton onClick={() => setImageViewDialog({ open: false, src: '', title: '' })}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 1 }}>
          {imageViewDialog.src && (
            <img
              src={imageViewDialog.src}
              alt={imageViewDialog.title}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Navigation>
  );
}
