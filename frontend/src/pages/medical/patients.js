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
  Edit as EditIcon,
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

// Common medications with separate drug names and strengths
const COMMON_DRUG_NAMES = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Omeprazole', 'Metformin', 'Amlodipine',
  'Atorvastatin', 'Aspirin', 'Losartan', 'Levothyroxine', 'Furosemide', 'Prednisolone',
  'Salbutamol', 'Insulin Regular', 'Multivitamin', 'Ciprofloxacin', 'Diclofenac',
  'Cephalexin', 'Azithromycin', 'Simvastatin', 'Lisinopril', 'Warfarin', 'Digoxin',
  'Hydrochlorothiazide', 'Ranitidine', 'Cetirizine', 'Loratadine', 'Dexamethasone',
  'Nifedipine', 'Captopril', 'Spironolactone', 'Gabapentin', 'Tramadol'
];

const DRUG_STRENGTHS = {
  'Paracetamol': ['325mg', '500mg', '650mg', '1g'],
  'Ibuprofen': ['200mg', '400mg', '600mg', '800mg'],
  'Amoxicillin': ['250mg', '500mg', '875mg', '1g'],
  'Omeprazole': ['10mg', '20mg', '40mg'],
  'Metformin': ['250mg', '500mg', '850mg', '1000mg'],
  'Amlodipine': ['2.5mg', '5mg', '10mg'],
  'Atorvastatin': ['10mg', '20mg', '40mg', '80mg'],
  'Aspirin': ['75mg', '81mg', '325mg', '500mg'],
  'Losartan': ['25mg', '50mg', '100mg'],
  'Levothyroxine': ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg'],
  'Furosemide': ['20mg', '40mg', '80mg'],
  'Prednisolone': ['5mg', '10mg', '25mg'],
  'Salbutamol': ['100mcg/dose inhaler', '2mg tablet', '4mg tablet'],
  'Insulin Regular': ['100 units/ml', '10ml vial', 'Pen injector'],
  'Multivitamin': ['Standard formula', 'Senior formula', 'Prenatal'],
  'Ciprofloxacin': ['250mg', '500mg', '750mg'],
  'Diclofenac': ['25mg', '50mg', '75mg', '100mg'],
  'Cephalexin': ['250mg', '500mg', '750mg'],
  'Azithromycin': ['250mg', '500mg'],
  'Simvastatin': ['10mg', '20mg', '40mg', '80mg'],
  'Lisinopril': ['2.5mg', '5mg', '10mg', '20mg'],
  'Warfarin': ['1mg', '2mg', '2.5mg', '5mg', '10mg'],
  'Digoxin': ['0.125mg', '0.25mg'],
  'Hydrochlorothiazide': ['12.5mg', '25mg', '50mg'],
  'Ranitidine': ['75mg', '150mg', '300mg'],
  'Cetirizine': ['5mg', '10mg'],
  'Loratadine': ['5mg', '10mg'],
  'Dexamethasone': ['0.5mg', '1mg', '2mg', '4mg'],
  'Nifedipine': ['10mg', '20mg', '30mg', '60mg'],
  'Captopril': ['12.5mg', '25mg', '50mg'],
  'Spironolactone': ['25mg', '50mg', '100mg'],
  'Gabapentin': ['100mg', '300mg', '400mg', '600mg', '800mg'],
  'Tramadol': ['50mg', '100mg']
};

const COMMON_DOSAGES = [
  '1/2 tablet', '1 tablet', '1.5 tablets', '2 tablets', '3 tablets',
  '1 capsule', '2 capsules', '3 capsules',
  '2.5ml', '5ml', '10ml', '15ml', '20ml',
  '1 teaspoon (5ml)', '1 tablespoon (15ml)',
  '1 puff', '2 puffs', '3 puffs',
  '1 injection', '2 injections',
  '1 drop', '2 drops', '3 drops each eye',
  '1 patch', 'As directed'
];

const COMMON_FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Every 24 hours', 'Every other day', 'Every 3 days',
  'Once weekly', 'Twice weekly', 'Three times weekly',
  'As needed (PRN)', 'Before meals', 'After meals', 'At bedtime',
  'In the morning', 'In the evening', 'When required'
];

const DURATION_OPTIONS = [
  '1 day', '2 days', '3 days', '5 days', '7 days', '10 days', '14 days',
  '3 weeks', '1 month', '6 weeks', '2 months', '3 months', '6 months',
  'Until finished', 'Ongoing', 'As needed', 'Single dose'
];

const MEAL_TIMING_OPTIONS = [
  'No specific timing',
  'Take with food',
  'Take after meals',
  'Take before meals (30 min)',
  'Take on empty stomach (1 hour before meals)',
  'Take between meals',
  'Take at bedtime',
  'Take in the morning',
  'Take with plenty of water',
  'Do not take with dairy products'
];

// Smart defaults for common medications based on typical medical usage
const DRUG_DEFAULTS = {
  'Paracetamol': {
    strength: '500mg',
    dosage: '1 tablet',
    frequency: 'Three times daily',
    duration: '5 days',
    mealTiming: 'Take with food'
  },
  'Ibuprofen': {
    strength: '400mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '5 days',
    mealTiming: 'Take with food'
  },
  'Amoxicillin': {
    strength: '500mg',
    dosage: '1 capsule',
    frequency: 'Three times daily',
    duration: '7 days',
    mealTiming: 'Take before meals (30 min)'
  },
  'Omeprazole': {
    strength: '20mg',
    dosage: '1 capsule',
    frequency: 'Once daily',
    duration: '14 days',
    mealTiming: 'Take before meals (30 min)'
  },
  'Metformin': {
    strength: '850mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '1 month',
    mealTiming: 'Take with food'
  },
  'Amlodipine': {
    strength: '5mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'No specific timing'
  },
  'Atorvastatin': {
    strength: '20mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take at bedtime'
  },
  'Lisinopril': {
    strength: '10mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'No specific timing'
  },
  'Levothyroxine': {
    strength: '75mcg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take on empty stomach (1 hour before meals)'
  },
  'Aspirin': {
    strength: '75mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take with food'
  },
  'Clopidogrel': {
    strength: '75mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take with food'
  },
  'Metoprolol': {
    strength: '50mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '1 month',
    mealTiming: 'Take with food'
  },
  'Lorazepam': {
    strength: '1mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '7 days',
    mealTiming: 'No specific timing'
  },
  'Diclofenac': {
    strength: '50mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '5 days',
    mealTiming: 'Take with food'
  },
  'Ciprofloxacin': {
    strength: '500mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '7 days',
    mealTiming: 'Take with plenty of water'
  },
  'Doxycycline': {
    strength: '100mg',
    dosage: '1 capsule',
    frequency: 'Twice daily',
    duration: '7 days',
    mealTiming: 'Take with food'
  },
  'Prednisolone': {
    strength: '5mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '5 days',
    mealTiming: 'Take with food'
  },
  'Salbutamol': {
    strength: '100mcg/puff',
    dosage: '2 puffs',
    frequency: 'Four times daily',
    duration: '1 month',
    mealTiming: 'No specific timing'
  },
  'Insulin': {
    strength: '100IU/ml',
    dosage: '10 units',
    frequency: 'Twice daily',
    duration: '1 month',
    mealTiming: 'Take before meals (30 min)'
  },
  'Warfarin': {
    strength: '5mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take at bedtime'
  },
  'Hydrochlorothiazide': {
    strength: '25mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take in the morning'
  },
  'Losartan': {
    strength: '50mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'No specific timing'
  },
  'Gabapentin': {
    strength: '300mg',
    dosage: '1 capsule',
    frequency: 'Three times daily',
    duration: '14 days',
    mealTiming: 'Take with food'
  },
  'Cetirizine': {
    strength: '10mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '7 days',
    mealTiming: 'Take at bedtime'
  },
  'Ranitidine': {
    strength: '150mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '14 days',
    mealTiming: 'Take before meals (30 min)'
  },
  'Simvastatin': {
    strength: '20mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '1 month',
    mealTiming: 'Take at bedtime'
  },
  'Furosemide': {
    strength: '40mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '14 days',
    mealTiming: 'Take in the morning'
  },
  'Tramadol': {
    strength: '50mg',
    dosage: '1 tablet',
    frequency: 'Three times daily',
    duration: '5 days',
    mealTiming: 'Take with food'
  },
  'Azithromycin': {
    strength: '500mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '5 days',
    mealTiming: 'Take on empty stomach (1 hour before meals)'
  },
  'Clarithromycin': {
    strength: '500mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '7 days',
    mealTiming: 'Take with food'
  },
  'Fluconazole': {
    strength: '150mg',
    dosage: '1 capsule',
    frequency: 'Once daily',
    duration: '7 days',
    mealTiming: 'No specific timing'
  },
  'Pantoprazole': {
    strength: '40mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '14 days',
    mealTiming: 'Take before meals (30 min)'
  },
  'Esomeprazole': {
    strength: '40mg',
    dosage: '1 capsule',
    frequency: 'Once daily',
    duration: '14 days',
    mealTiming: 'Take before meals (30 min)'
  }
};

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
  const [editPrescriptionDialog, setEditPrescriptionDialog] = React.useState(false);
  const [labTestDialog, setLabTestDialog] = React.useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = React.useState(false);
  const [selectedPrescriptionForAction, setSelectedPrescriptionForAction] = React.useState(null);
  
  const [prescriptionForm, setPrescriptionForm] = React.useState({
    medications: [{
      drugName: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      mealTiming: 'No specific timing',
      instructions: '',
      customDrugName: '',
      customStrength: '',
      customDosage: '',
      customFrequency: '',
      customDuration: ''
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
    // Process and validate medications with new structure
    const processedMedications = prescriptionForm.medications
      .map(med => {
        // Construct final medication object
        const finalMed = {
          name: med.drugName === 'Other' ? med.customDrugName : 
                `${med.drugName} ${med.strength === 'Other' ? med.customStrength : med.strength}`.trim(),
          dosage: med.dosage === 'Other' ? med.customDosage : med.dosage,
          frequency: med.frequency === 'Other' ? med.customFrequency : med.frequency,
          duration: med.duration === 'Other' ? med.customDuration : med.duration,
          mealTiming: med.mealTiming,
          instructions: med.instructions
        };
        return finalMed;
      })
      .filter(med => 
        med.name && med.dosage && med.frequency && med.duration
      );

    if (!selectedPatient || processedMedications.length === 0) {
      setError('Please fill in all required details for at least one medication');
      return;
    }

    setLoading(true);
    try {
      // Create FormData to handle both text and image data
      const formData = new FormData();
      formData.append('patientId', selectedPatient._id);
      formData.append('medications', JSON.stringify(processedMedications));
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
          drugName: '',
          strength: '',
          dosage: '',
          frequency: '',
          duration: '',
          mealTiming: 'No specific timing',
          instructions: '',
          customDrugName: '',
          customStrength: '',
          customDosage: '',
          customFrequency: '',
          customDuration: ''
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
    setPrescriptionForm(prev => {
      // Get the first medication to use as template for common fields
      const firstMed = prev.medications.length > 0 ? prev.medications[0] : null;
      
      // Create new medication with smart defaults
      const newMedication = {
        drugName: '',
        strength: '',
        dosage: firstMed?.dosage || '', // Use first medication's dosage
        frequency: firstMed?.frequency || '', // Use first medication's frequency  
        duration: firstMed?.duration || '', // Use first medication's duration
        mealTiming: firstMed?.mealTiming || 'No specific timing', // Use first medication's meal timing
        instructions: '',
        customDrugName: '',
        customStrength: '',
        customDosage: firstMed?.customDosage || '',
        customFrequency: firstMed?.customFrequency || '',
        customDuration: firstMed?.customDuration || ''
      };

      return {
        ...prev,
        medications: [...prev.medications, newMedication]
      };
    });
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

  // Apply common settings from first medication to all others
  const applyCommonSettings = () => {
    setPrescriptionForm(prev => {
      if (prev.medications.length < 2) return prev;
      
      const firstMed = prev.medications[0];

      return {
        ...prev,
        medications: prev.medications.map((med, index) => {
          if (index === 0) return med; // Keep first medication unchanged
          
          // Apply common settings but validate strength compatibility
          const updatedMed = { ...med };
          
          // Only apply strength if it's available for this drug or if it's "Other"
          if (firstMed.strength === 'Other' || 
              (med.drugName && DRUG_STRENGTHS[med.drugName] && DRUG_STRENGTHS[med.drugName].includes(firstMed.strength))) {
            updatedMed.strength = firstMed.strength;
            updatedMed.customStrength = firstMed.customStrength;
          } else if (med.drugName && DRUG_STRENGTHS[med.drugName] && DRUG_STRENGTHS[med.drugName].length > 0) {
            // Use the first available strength for this drug if the common one isn't compatible
            updatedMed.strength = DRUG_STRENGTHS[med.drugName][0];
            updatedMed.customStrength = '';
          }
          
          // Apply other common settings
          updatedMed.frequency = firstMed.frequency;
          updatedMed.duration = firstMed.duration;
          updatedMed.mealTiming = firstMed.mealTiming;
          updatedMed.customFrequency = firstMed.customFrequency;
          updatedMed.customDuration = firstMed.customDuration;
          
          return updatedMed;
        })
      };
    });

    // Show success message
    setSuccess(`Applied common settings from first medication to ${prescriptionForm.medications.length - 1} other medications (strength may vary by drug compatibility)`);
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
    // Parse the old medication name format to extract drug name and strength
    const parseMedication = (medName) => {
      // Try to extract drug name and strength from formats like "Paracetamol 500mg"
      const match = medName.match(/^(.+?)\s+(\d+(?:\.\d+)?(?:mg|mcg|g|ml|units|%))$/i);
      if (match) {
        return {
          drugName: match[1].trim(),
          strength: match[2]
        };
      }
      // If no match, treat as custom drug
      return {
        drugName: 'Other',
        customDrugName: medName
      };
    };
    
    const parsed = parseMedication(medication.name);
    
    // Find the first empty medication slot or add a new one
    const emptyIndex = prescriptionForm.medications.findIndex(med => !med.drugName && !med.customDrugName);
    
    const newMedication = {
      drugName: parsed.drugName,
      strength: parsed.strength || '',
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      mealTiming: 'No specific timing',
      instructions: medication.instructions || '',
      customDrugName: parsed.customDrugName || '',
      customStrength: parsed.drugName === 'Other' ? parsed.strength : '',
      customDosage: '',
      customFrequency: '',
      customDuration: ''
    };
    
    if (emptyIndex !== -1) {
      // Fill empty slot
      Object.keys(newMedication).forEach(key => {
        updateMedication(emptyIndex, key, newMedication[key]);
      });
    } else {
      // Add new medication
      setPrescriptionForm(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication]
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

  // Edit and Delete Prescription Handlers
  const handleEditPrescription = (prescription) => {
    // Convert prescription data back to form format
    const formattedMedications = prescription.medications ? prescription.medications.map(med => {
      // Parse medication name and strength
      const nameParts = med.name.split(' ');
      let drugName = '';
      let strength = '';
      
      // Try to match with common drugs
      const matchedDrug = COMMON_DRUG_NAMES.find(drug => med.name.toLowerCase().includes(drug.toLowerCase()));
      if (matchedDrug) {
        drugName = matchedDrug;
        const remainingParts = med.name.replace(matchedDrug, '').trim();
        strength = remainingParts || 'Not specified';
      } else {
        drugName = 'Other';
        strength = 'Other';
      }

      return {
        drugName: drugName,
        strength: strength,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        mealTiming: med.mealTiming || 'No specific timing',
        instructions: med.instructions || '',
        customDrugName: drugName === 'Other' ? med.name : '',
        customStrength: strength === 'Other' ? med.name.split(' ').slice(-1)[0] : '',
        customDosage: '',
        customFrequency: '',
        customDuration: ''
      };
    }) : [{
      drugName: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      mealTiming: 'No specific timing',
      instructions: '',
      customDrugName: '',
      customStrength: '',
      customDosage: '',
      customFrequency: '',
      customDuration: ''
    }];

    setPrescriptionForm({
      medications: formattedMedications,
      generalInstructions: prescription.generalInstructions || prescription.instructions || ''
    });
    
    setSelectedPrescriptionForAction(prescription);
    setEditPrescriptionDialog(true);
  };

  const handleUpdatePrescription = async () => {
    if (!selectedPrescriptionForAction) return;

    setLoading(true);
    try {
      // Process medications similar to create prescription
      const processedMedications = prescriptionForm.medications
        .map(med => {
          const finalMed = {
            name: med.drugName === 'Other' ? med.customDrugName : 
                  `${med.drugName} ${med.strength === 'Other' ? med.customStrength : med.strength}`.trim(),
            dosage: med.dosage === 'Other' ? med.customDosage : med.dosage,
            frequency: med.frequency === 'Other' ? med.customFrequency : med.frequency,
            duration: med.duration === 'Other' ? med.customDuration : med.duration,
            mealTiming: med.mealTiming,
            instructions: med.instructions
          };
          return finalMed;
        })
        .filter(med => 
          med.name && med.dosage && med.frequency && med.duration
        );

      if (processedMedications.length === 0) {
        setError('Please fill in all required details for at least one medication');
        return;
      }

      const updateData = {
        medications: processedMedications,
        generalInstructions: prescriptionForm.generalInstructions
      };

      const response = await api.put(`/prescriptions/${selectedPrescriptionForAction._id}`, updateData);
      
      setSuccess('Prescription updated successfully!');
      setEditPrescriptionDialog(false);
      setPrescriptionForm({ 
        medications: [{
          drugName: '',
          strength: '',
          dosage: '',
          frequency: '',
          duration: '',
          mealTiming: 'No specific timing',
          instructions: '',
          customDrugName: '',
          customStrength: '',
          customDosage: '',
          customFrequency: '',
          customDuration: ''
        }],
        generalInstructions: ''
      });
      setSelectedPrescriptionForAction(null);
      
      // Refresh prescriptions
      if (selectedPatient) {
        const response = await api.get(`/prescriptions/patient/${selectedPatient._id}`);
        setPrescriptions(response.prescriptions || []);
      }
    } catch (err) {
      setError(`Failed to update prescription: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = (prescription) => {
    setSelectedPrescriptionForAction(prescription);
    setDeleteConfirmDialog(true);
  };

  const confirmDeletePrescription = async () => {
    if (!selectedPrescriptionForAction) return;

    console.log('Attempting to delete prescription:', selectedPrescriptionForAction._id);
    setLoading(true);
    try {
      const response = await api.delete(`/prescriptions/${selectedPrescriptionForAction._id}`);
      console.log('Delete response:', response);
      
      setSuccess('Prescription deleted successfully!');
      setDeleteConfirmDialog(false);
      setSelectedPrescriptionForAction(null);
      
      // Refresh prescriptions
      if (selectedPatient) {
        const response = await api.get(`/prescriptions/patient/${selectedPatient._id}`);
        setPrescriptions(response.prescriptions || []);
      }
    } catch (err) {
      console.error('Delete prescription error:', err);
      console.error('Error response:', err.response);
      setError(`Failed to delete prescription: ${err.response?.data?.error || err.message}`);
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
                            {patient.bloodGroup && (
                              <Chip 
                                label={`${patient.bloodGroup}`}
                                size="small" 
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 'bold' }}
                              />
                            )}
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                              {/* Action Buttons */}
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditPrescription(prescription)}
                                  disabled={prescription.status === 'completed' || prescription.status === 'cancelled'}
                                  sx={{ 
                                    bgcolor: 'primary.50',
                                    '&:hover': { bgcolor: 'primary.100' },
                                    '&:disabled': { bgcolor: 'grey.100' }
                                  }}
                                  title="Edit Prescription"
                                >
                                  <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeletePrescription(prescription)}
                                  sx={{ 
                                    bgcolor: 'error.50',
                                    '&:hover': { bgcolor: 'error.100' }
                                  }}
                                  title="Delete Prescription"
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                              </Box>
                              {/* Status and Date Info */}
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
                          </Box>

                          {/* Medications Section */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                              Medications ({prescription.medications?.length || 1}):
                            </Typography>
                            <Box sx={{ bgcolor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 1, p: 2 }}>
                              {prescription.medications ? (
                                prescription.medications.map((med, index) => (
                                  <Typography 
                                    key={index} 
                                    variant="body2" 
                                    sx={{ 
                                      mb: 1, 
                                      fontFamily: 'monospace',
                                      fontSize: '0.9rem',
                                      lineHeight: 1.4,
                                      color: '#333'
                                    }}
                                  >
                                    <strong style={{ color: '#1976d2', marginRight: '8px' }}>
                                      {index + 1}.
                                    </strong>
                                    <span style={{ fontWeight: 'bold' }}>{med.name}</span>
                                    <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                    {med.dosage}
                                    <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                    {med.frequency}
                                    <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                    {med.duration}
                                    {med.mealTiming && med.mealTiming !== 'No specific timing' && (
                                      <>
                                        <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                        <span style={{ color: '#ed6c02', fontWeight: '500' }}>
                                          {med.mealTiming}
                                        </span>
                                      </>
                                    )}
                                    {med.instructions && (
                                      <>
                                        <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                        <span style={{ fontStyle: 'italic', color: '#666' }}>
                                          {med.instructions}
                                        </span>
                                      </>
                                    )}
                                  </Typography>
                                ))
                              ) : (
                                // Backward compatibility for old single medication format
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.4,
                                    color: '#333'
                                  }}
                                >
                                  <strong style={{ color: '#1976d2', marginRight: '8px' }}>1.</strong>
                                  <span style={{ fontWeight: 'bold' }}>{prescription.medication}</span>
                                  <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                  {prescription.dosage}
                                  <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                  {prescription.frequency}
                                  <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                  {prescription.duration}
                                </Typography>
                              )}
                            </Box>
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
            
            {/* Smart Defaults Info */}
            <Alert severity="info" sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
              <Typography variant="body2">
                <strong>💡 Smart Defaults:</strong> When you select a drug name, common dosage, frequency, duration, and meal timing will be automatically filled based on typical medical practice. You can always modify these as needed.
              </Typography>
            </Alert>
            
            <Box sx={{ mt: 2 }}>
              {prescriptionForm.medications.map((medication, index) => (
                <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary">
                        Medication {index + 1}
                      </Typography>
                      {(index > 0 || (medication.drugName && DRUG_DEFAULTS[medication.drugName])) && (
                        <Typography variant="caption" sx={{ 
                          bgcolor: medication.drugName && DRUG_DEFAULTS[medication.drugName] ? 'primary.light' : 'success.light', 
                          color: 'white',
                          px: 1, 
                          py: 0.25, 
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}>
                          {medication.drugName && DRUG_DEFAULTS[medication.drugName] ? 
                            '🎯 Drug-specific defaults' : 
                            '📋 Smart defaults applied'
                          }
                        </Typography>
                      )}
                    </Box>
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
                        <InputLabel>Drug Name *</InputLabel>
                        <Select
                          value={medication.drugName || ''}
                          onChange={(e) => {
                            const drugName = e.target.value;
                            // Apply smart defaults when drug is selected
                            if (drugName && drugName !== 'Other' && DRUG_DEFAULTS[drugName]) {
                              const defaults = DRUG_DEFAULTS[drugName];
                              setPrescriptionForm(prev => ({
                                ...prev,
                                medications: prev.medications.map((med, i) => 
                                  i === index ? { 
                                    ...med, 
                                    drugName: drugName,
                                    strength: defaults.strength || '', // Auto-populate common strength
                                    dosage: defaults.dosage,
                                    frequency: defaults.frequency,
                                    duration: defaults.duration,
                                    mealTiming: defaults.mealTiming
                                  } : med
                                )
                              }));
                              setSuccess(`Smart defaults applied for ${drugName}: ${defaults.strength || 'No strength'}, ${defaults.dosage}, ${defaults.frequency}, ${defaults.duration}, ${defaults.mealTiming}`);
                            } else {
                              updateMedication(index, 'drugName', drugName);
                              updateMedication(index, 'strength', ''); // Reset strength when drug changes
                            }
                          }}
                          label="Drug Name *"
                        >
                          {COMMON_DRUG_NAMES.map((drug) => (
                            <MenuItem key={drug} value={drug}>
                              {drug}
                            </MenuItem>
                          ))}
                          <MenuItem value="Other">
                            <em>Other (type manually)</em>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {medication.drugName === 'Other' && (
                        <TextField
                          fullWidth
                          label="Enter Drug Name"
                          value={medication.customDrugName || ''}
                          onChange={(e) => updateMedication(index, 'customDrugName', e.target.value)}
                          sx={{ mt: 1 }}
                          size="small"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!medication.drugName || medication.drugName === 'Other'}>
                        <InputLabel>Strength *</InputLabel>
                        <Select
                          value={medication.strength || ''}
                          onChange={(e) => updateMedication(index, 'strength', e.target.value)}
                          label="Strength *"
                        >
                          {(DRUG_STRENGTHS[medication.drugName] || []).map((strength) => (
                            <MenuItem key={strength} value={strength}>
                              {strength}
                            </MenuItem>
                          ))}
                          <MenuItem value="Other">
                            <em>Other strength</em>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {(medication.strength === 'Other' || medication.drugName === 'Other') && (
                        <TextField
                          fullWidth
                          label="Enter Strength"
                          value={medication.customStrength || ''}
                          onChange={(e) => updateMedication(index, 'customStrength', e.target.value)}
                          placeholder="e.g., 250mg, 5ml/5mg"
                          sx={{ mt: 1 }}
                          size="small"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Dosage *</InputLabel>
                        <Select
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          label="Dosage *"
                        >
                          {COMMON_DOSAGES.map((dosage) => (
                            <MenuItem key={dosage} value={dosage}>
                              {dosage}
                            </MenuItem>
                          ))}
                          <MenuItem value="Other">
                            <em>Other dosage</em>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {medication.dosage === 'Other' && (
                        <TextField
                          fullWidth
                          label="Enter Dosage"
                          value={medication.customDosage || ''}
                          onChange={(e) => updateMedication(index, 'customDosage', e.target.value)}
                          placeholder="e.g., 1.5 tablets, 7.5ml"
                          sx={{ mt: 1 }}
                          size="small"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Frequency *</InputLabel>
                        <Select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          label="Frequency *"
                        >
                          {COMMON_FREQUENCIES.map((freq) => (
                            <MenuItem key={freq} value={freq}>
                              {freq}
                            </MenuItem>
                          ))}
                          <MenuItem value="Other">
                            <em>Other frequency</em>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {medication.frequency === 'Other' && (
                        <TextField
                          fullWidth
                          label="Enter Frequency"
                          value={medication.customFrequency || ''}
                          onChange={(e) => updateMedication(index, 'customFrequency', e.target.value)}
                          placeholder="e.g., Every 2 hours"
                          sx={{ mt: 1 }}
                          size="small"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Duration *</InputLabel>
                        <Select
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          label="Duration *"
                        >
                          {DURATION_OPTIONS.map((duration) => (
                            <MenuItem key={duration} value={duration}>
                              {duration}
                            </MenuItem>
                          ))}
                          <MenuItem value="Other">
                            <em>Other duration</em>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {medication.duration === 'Other' && (
                        <TextField
                          fullWidth
                          label="Enter Duration"
                          value={medication.customDuration || ''}
                          onChange={(e) => updateMedication(index, 'customDuration', e.target.value)}
                          placeholder="e.g., 10 days, Until symptoms resolve"
                          sx={{ mt: 1 }}
                          size="small"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Meal Timing</InputLabel>
                        <Select
                          value={medication.mealTiming || 'No specific timing'}
                          onChange={(e) => updateMedication(index, 'mealTiming', e.target.value)}
                          label="Meal Timing"
                        >
                          {MEAL_TIMING_OPTIONS.map((timing) => (
                            <MenuItem key={timing} value={timing}>
                              {timing}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Special Instructions for this medication"
                          value={medication.instructions || ''}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="Additional instructions beyond meal timing (e.g., Avoid alcohol, Monitor for side effects)"
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

              {/* Prescription Preview */}
              {prescriptionForm.medications.some(med => med.drugName && med.dosage && med.frequency && med.duration) && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f8ff', border: '1px solid #cce7ff', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    📋 Prescription Preview (Traditional Format)
                  </Typography>
                  <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                    {prescriptionForm.medications
                      .filter(med => med.drugName && med.dosage && med.frequency && med.duration)
                      .map((med, index) => (
                        <Typography 
                          key={index} 
                          variant="body2" 
                          sx={{ 
                            mb: 1, 
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            color: '#333'
                          }}
                        >
                          <strong style={{ color: '#1976d2', marginRight: '8px' }}>
                            {index + 1}.
                          </strong>
                          <span style={{ fontWeight: 'bold' }}>
                            {med.drugName === 'Other' ? med.customDrugName : 
                             `${med.drugName} ${med.strength === 'Other' ? med.customStrength : med.strength}`.trim()}
                          </span>
                          <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                          {med.dosage === 'Other' ? med.customDosage : med.dosage}
                          <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                          {med.frequency === 'Other' ? med.customFrequency : med.frequency}
                          <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                          {med.duration === 'Other' ? med.customDuration : med.duration}
                          {med.mealTiming && med.mealTiming !== 'No specific timing' && (
                            <>
                              <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                              <span style={{ color: '#ed6c02', fontWeight: '500' }}>
                                {med.mealTiming}
                              </span>
                            </>
                          )}
                          {med.instructions && (
                            <>
                              <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                              <span style={{ fontStyle: 'italic', color: '#666' }}>
                                {med.instructions}
                              </span>
                            </>
                          )}
                        </Typography>
                      ))}
                    {prescriptionForm.generalInstructions && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 2, 
                          pt: 1, 
                          borderTop: '1px dashed #ccc',
                          fontStyle: 'italic',
                          color: '#555'
                        }}
                      >
                        <strong>General Instructions:</strong> {prescriptionForm.generalInstructions}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

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
              disabled={prescriptionForm.medications.every(med => {
                // Check if drug name is filled (either from dropdown or custom)
                const hasDrugName = med.drugName === 'Other' ? !med.customDrugName : !med.drugName;
                // Check if dosage is filled (either from dropdown or custom)
                const hasDosage = med.dosage === 'Other' ? !med.customDosage : !med.dosage;
                // Check if frequency is filled (either from dropdown or custom)
                const hasFrequency = med.frequency === 'Other' ? !med.customFrequency : !med.frequency;
                // Check if duration is filled (either from dropdown or custom)
                const hasDuration = med.duration === 'Other' ? !med.customDuration : !med.duration;
                
                return hasDrugName || hasDosage || hasFrequency || hasDuration;
              })}
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

      {/* Edit Prescription Dialog */}
      <Dialog 
        open={editPrescriptionDialog} 
        onClose={() => {
          setEditPrescriptionDialog(false);
          setSelectedPrescriptionForAction(null);
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Edit Prescription - {selectedPrescriptionForAction?.prescriptionNumber}
        </DialogTitle>
        <DialogContent>
          {/* Medications Section - Reuse the same form structure as create prescription */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicationIcon />
            Medications
          </Typography>

          {prescriptionForm.medications.map((medication, index) => (
            <Card key={index} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Medication #{index + 1}
                </Typography>
                {prescriptionForm.medications.length > 1 && (
                  <IconButton 
                    size="small" 
                    onClick={() => removeMedication(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                {/* Drug Name Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Drug Name *</InputLabel>
                    <Select
                      value={medication.drugName || ''}
                      onChange={(e) => {
                        const drugName = e.target.value;
                        // Apply smart defaults when drug is selected
                        if (drugName && drugName !== 'Other' && DRUG_DEFAULTS[drugName]) {
                          const defaults = DRUG_DEFAULTS[drugName];
                          setPrescriptionForm(prev => ({
                            ...prev,
                            medications: prev.medications.map((med, i) => 
                              i === index ? { 
                                ...med, 
                                drugName: drugName,
                                strength: defaults.strength || '', // Auto-populate common strength
                                dosage: defaults.dosage,
                                frequency: defaults.frequency,
                                duration: defaults.duration,
                                mealTiming: defaults.mealTiming
                              } : med
                            )
                          }));
                          setSuccess(`Smart defaults applied for ${drugName}: ${defaults.strength || 'No strength'}, ${defaults.dosage}, ${defaults.frequency}, ${defaults.duration}, ${defaults.mealTiming}`);
                        } else {
                          updateMedication(index, 'drugName', drugName);
                        }
                      }}
                      label="Drug Name *"
                    >
                      {COMMON_DRUG_NAMES.map((drug) => (
                        <MenuItem key={drug} value={drug}>
                          {drug}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other (Custom)</MenuItem>
                    </Select>
                  </FormControl>
                  {medication.drugName === 'Other' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Drug Name"
                      value={medication.customDrugName || ''}
                      onChange={(e) => updateMedication(index, 'customDrugName', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Strength Selection */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Strength *</InputLabel>
                    <Select
                      value={medication.strength || ''}
                      onChange={(e) => updateMedication(index, 'strength', e.target.value)}
                      label="Strength *"
                      disabled={!medication.drugName}
                    >
                      {medication.drugName && DRUG_STRENGTHS[medication.drugName] ? 
                        DRUG_STRENGTHS[medication.drugName].map((strength) => (
                          <MenuItem key={strength} value={strength}>
                            {strength}
                          </MenuItem>
                        )) : 
                        ['5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg'].map((strength) => (
                          <MenuItem key={strength} value={strength}>
                            {strength}
                          </MenuItem>
                        ))
                      }
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {medication.strength === 'Other' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Strength"
                      value={medication.customStrength || ''}
                      onChange={(e) => updateMedication(index, 'customStrength', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Dosage */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Dosage *</InputLabel>
                    <Select
                      value={medication.dosage || ''}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      label="Dosage *"
                    >
                      {['1 tablet', '2 tablets', '3 tablets', '1/2 tablet', '1 capsule', '2 capsules', '5ml', '10ml', '15ml', '1 teaspoon', '2 teaspoons'].map((dosage) => (
                        <MenuItem key={dosage} value={dosage}>
                          {dosage}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {medication.dosage === 'Other' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Dosage"
                      value={medication.customDosage || ''}
                      onChange={(e) => updateMedication(index, 'customDosage', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Frequency */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Frequency *</InputLabel>
                    <Select
                      value={medication.frequency || ''}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      label="Frequency *"
                    >
                      {['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed', 'Before sleep'].map((freq) => (
                        <MenuItem key={freq} value={freq}>
                          {freq}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {medication.frequency === 'Other' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Frequency"
                      value={medication.customFrequency || ''}
                      onChange={(e) => updateMedication(index, 'customFrequency', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Duration */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Duration *</InputLabel>
                    <Select
                      value={medication.duration || ''}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      label="Duration *"
                    >
                      {['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '1 month', '2 months', '3 months', '6 months'].map((duration) => (
                        <MenuItem key={duration} value={duration}>
                          {duration}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {medication.duration === 'Other' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Duration"
                      value={medication.customDuration || ''}
                      onChange={(e) => updateMedication(index, 'customDuration', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Meal Timing */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Meal Timing</InputLabel>
                    <Select
                      value={medication.mealTiming || 'No specific timing'}
                      onChange={(e) => updateMedication(index, 'mealTiming', e.target.value)}
                      label="Meal Timing"
                    >
                      {MEAL_TIMING_OPTIONS.map((timing) => (
                        <MenuItem key={timing} value={timing}>
                          {timing}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Instructions */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Special Instructions for this medication"
                    value={medication.instructions || ''}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    placeholder="Additional instructions beyond meal timing"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Card>
          ))}

          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addMedication}
              variant="outlined"
              color="primary"
            >
              Add Another Medication
            </Button>
            {prescriptionForm.medications.length > 1 && (
              <Button
                onClick={applyCommonSettings}
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ textTransform: 'none' }}
                title="Apply frequency, duration, and meal timing from first medication to all others"
              >
                📋 Apply Common Settings
              </Button>
            )}
          </Box>

          {/* Prescription Preview */}
          {prescriptionForm.medications.some(med => med.drugName && med.dosage && med.frequency && med.duration) && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f8ff', border: '1px solid #cce7ff', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                📋 Updated Prescription Preview (Traditional Format)
              </Typography>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                {prescriptionForm.medications
                  .filter(med => med.drugName && med.dosage && med.frequency && med.duration)
                  .map((med, index) => (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      sx={{ 
                        mb: 1, 
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        color: '#333'
                      }}
                    >
                      <strong style={{ color: '#1976d2', marginRight: '8px' }}>
                        {index + 1}.
                      </strong>
                      <span style={{ fontWeight: 'bold' }}>
                        {med.drugName === 'Other' ? med.customDrugName : 
                         `${med.drugName} ${med.strength === 'Other' ? med.customStrength : med.strength}`.trim()}
                      </span>
                      <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                      {med.dosage === 'Other' ? med.customDosage : med.dosage}
                      <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                      {med.frequency === 'Other' ? med.customFrequency : med.frequency}
                      <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                      {med.duration === 'Other' ? med.customDuration : med.duration}
                      {med.mealTiming && med.mealTiming !== 'No specific timing' && (
                        <>
                          <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                          <span style={{ color: '#ed6c02', fontWeight: '500' }}>
                            {med.mealTiming}
                          </span>
                        </>
                      )}
                      {med.instructions && (
                        <>
                          <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                          <span style={{ fontStyle: 'italic', color: '#666' }}>
                            {med.instructions}
                          </span>
                        </>
                      )}
                    </Typography>
                  ))}
                {prescriptionForm.generalInstructions && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2, 
                      pt: 1, 
                      borderTop: '1px dashed #ccc',
                      fontStyle: 'italic',
                      color: '#555'
                    }}
                  >
                    <strong>General Instructions:</strong> {prescriptionForm.generalInstructions}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* General Instructions */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="General Instructions"
              value={prescriptionForm.generalInstructions || ''}
              onChange={(e) => setPrescriptionForm(prev => ({ ...prev, generalInstructions: e.target.value }))}
              placeholder="Overall instructions for the prescription (e.g., Complete the full course, Follow up in 1 week)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditPrescriptionDialog(false);
            setSelectedPrescriptionForAction(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePrescription} 
            variant="contained" 
            disabled={prescriptionForm.medications.every(med => {
              const hasDrugName = med.drugName === 'Other' ? !med.customDrugName : !med.drugName;
              const hasDosage = med.dosage === 'Other' ? !med.customDosage : !med.dosage;
              const hasFrequency = med.frequency === 'Other' ? !med.customFrequency : !med.frequency;
              const hasDuration = med.duration === 'Other' ? !med.customDuration : !med.duration;
              return hasDrugName || hasDosage || hasFrequency || hasDuration;
            })}
          >
            Update Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => {
          setDeleteConfirmDialog(false);
          setSelectedPrescriptionForAction(null);
        }}
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          Confirm Delete Prescription
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this prescription?
          </Typography>
          {selectedPrescriptionForAction && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Prescription: {selectedPrescriptionForAction.prescriptionNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient: {selectedPatient?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medications: {selectedPrescriptionForAction.medications?.length || 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(selectedPrescriptionForAction.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 'bold' }}>
            ⚠️ This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteConfirmDialog(false);
              setSelectedPrescriptionForAction(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePrescription} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Prescription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Navigation>
  );
}
