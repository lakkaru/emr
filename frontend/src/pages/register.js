import * as React from 'react';
import { 
  Container, TextField, Button, Typography, Box, Grid, Alert, Chip, Stack, IconButton,
  Card, CardContent, CardHeader, Divider, Paper, Avatar, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  PersonAdd as PersonAddIcon,
  LocalHospital as HospitalIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Healing as MedicalIcon,
  Security as InsuranceIcon,
  MonitorHeart as VitalsIcon
} from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import Navigation from '../components/Navigation';
import AllergyInput from '../components/AllergyInput';
import MedicationInput from '../components/MedicationInput';

export default function RegisterPage() {
  const { token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !token) {
      window.location.href = '/login';
    }
  }, [token]);
  
  const initialForm = {
    fullName: '', nickname: '', nic: '', dob: '', gender: '', address: '', 
    phones: [{ type: 'mobile', number: '' }], email: '',
    insurance: { provider: '', memberId: '', groupNumber: '' },
    referral: { source: '', contact: '' },
    allergies: [], medications: [], pastMedicalHistory: '', problemList: [], immunizations: [],
    vitalsAtCheckIn: { temperatureC: '', bloodPressure: '', respiratoryRate: '', pulse: '' }
  };
  const [form, setForm] = React.useState(initialForm);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [duplicate, setDuplicate] = React.useState(null);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const checkDuplicate = async () => {
    setDuplicate(null);
    const primaryPhone = form.phones?.[0]?.number;
    if (!form.fullName || !form.dob || !primaryPhone) return;
    try {
      const res = await api.post('/patients/check-duplicate', { fullName: form.fullName, dob: form.dob, phone: primaryPhone });
      setDuplicate(res.duplicate ? res.patient : null);
    } catch { /* ignore */ }
  };

  React.useEffect(() => { checkDuplicate(); }, [form.fullName, form.dob, form.phones]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      // Normalize numeric vitals - ensure proper data types
      payload.vitalsAtCheckIn = {
        temperatureC: payload.vitalsAtCheckIn?.temperatureC ? Number(payload.vitalsAtCheckIn.temperatureC) : null,
        bloodPressure: payload.vitalsAtCheckIn?.bloodPressure || null,
        respiratoryRate: payload.vitalsAtCheckIn?.respiratoryRate ? Number(payload.vitalsAtCheckIn.respiratoryRate) : null,
        pulse: payload.vitalsAtCheckIn?.pulse ? Number(payload.vitalsAtCheckIn.pulse) : null
      };
      if (!token) throw new Error('Please login');
      const created = await api.post('/patients', payload);
      setSuccess('Patient created');
      setForm(initialForm);
      setDuplicate(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    setForm(initialForm);
    setDuplicate(null);
  };

  const modifiedSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      // Normalize numeric vitals - ensure proper data types
      payload.vitalsAtCheckIn = {
        temperatureC: payload.vitalsAtCheckIn?.temperatureC ? Number(payload.vitalsAtCheckIn.temperatureC) : null,
        bloodPressure: payload.vitalsAtCheckIn?.bloodPressure || null,
        respiratoryRate: payload.vitalsAtCheckIn?.respiratoryRate ? Number(payload.vitalsAtCheckIn.respiratoryRate) : null,
        pulse: payload.vitalsAtCheckIn?.pulse ? Number(payload.vitalsAtCheckIn.pulse) : null
      };
      if (!token) throw new Error('Please login');
      const created = await api.post('/patients', payload);
      setShowSuccessDialog(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Navigation title="Patient Registration" currentPath="/register" showBackButton onBack={() => window.location.href = '/'}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3
      }}>
        <Container maxWidth="lg">
        <Card sx={{ mb: 3 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonAddIcon />
              </Avatar>
            }
            title={
              <Typography variant="h4" color="primary">
                New Patient Registration
              </Typography>
            }
            subheader="Electronic Medical Records - HIPAA Compliant"
          />
        </Card>

        <Box component="form" onSubmit={modifiedSubmit}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Patient Information" 
              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField 
                    label="Full Name" 
                    value={form.fullName} 
                    onChange={onChange('fullName')} 
                    required 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Nickname (Optional)" 
                    value={form.nickname} 
                    onChange={onChange('nickname')} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="NIC Number" 
                    value={form.nic} 
                    onChange={onChange('nic')} 
                    required 
                    fullWidth 
                    variant="outlined"
                    placeholder="e.g., 200012345678 or 12345678901V"
                    helperText="Enter National Identity Card number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date of Birth"
                    value={form.dob || null}
                    onChange={(val)=> setForm(f=>({...f, dob: val ? val.format('YYYY-MM-DD') : ''}))}
                    slotProps={{ textField: { fullWidth: true, required: true }}}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select
                    label="Gender" 
                    value={form.gender} 
                    onChange={onChange('gender')} 
                    fullWidth
                    // placeholder="Select Gender"
                  >
                    {/* <MenuItem value="">Select Gender</MenuItem> */}
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Address" value={form.address} onChange={onChange('address')} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Phone Numbers *
                  </Typography>
                  {form.phones.map((phone, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <TextField
                        select
                        label="Type"
                        value={phone.type}
                        onChange={(e) => {
                          const newPhones = [...form.phones];
                          newPhones[index].type = e.target.value;
                          setForm(f => ({ ...f, phones: newPhones }));
                        }}
                        sx={{ minWidth: 120 }}
                        SelectProps={{ native: true }}
                      >
                        <option value="mobile">Mobile</option>
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                      </TextField>
                      <TextField
                        label="Phone Number"
                        value={phone.number}
                        onChange={(e) => {
                          const newPhones = [...form.phones];
                          newPhones[index].number = e.target.value;
                          setForm(f => ({ ...f, phones: newPhones }));
                        }}
                        required={index === 0}
                        fullWidth
                      />
                      {form.phones.length > 1 && (
                        <IconButton
                          onClick={() => {
                            const newPhones = form.phones.filter((_, i) => i !== index);
                            setForm(f => ({ ...f, phones: newPhones }));
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {index === form.phones.length - 1 && (
                        <IconButton
                          onClick={() => {
                            setForm(f => ({ ...f, phones: [...f.phones, { type: 'mobile', number: '' }] }));
                          }}
                          color="primary"
                        >
                          <AddIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email Address" type="email" value={form.email} onChange={onChange('email')} fullWidth />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Duplicate Warning */}
          {duplicate && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Possible Duplicate Patient Detected</Typography>
              <Typography>
                Found similar patient: <strong>{duplicate.fullName}</strong> 
                (DOB: {new Date(duplicate.dob).toLocaleDateString()})
              </Typography>
            </Alert>
          )}

          {/* Insurance Information */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsuranceIcon color="primary" />
                <Typography variant="h6">Insurance Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    label="Insurance Provider" 
                    value={form.insurance.provider} 
                    onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, provider:e.target.value}}))} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Member ID" 
                    value={form.insurance.memberId} 
                    onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, memberId:e.target.value}}))} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Group Number" 
                    value={form.insurance.groupNumber} 
                    onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, groupNumber:e.target.value}}))} 
                    fullWidth 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Referral Information */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HospitalIcon color="primary" />
                <Typography variant="h6">Referral Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Referral Source" 
                    value={form.referral.source} 
                    onChange={(e)=>setForm(f=>({...f, referral:{...f.referral, source:e.target.value}}))} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Contact Information" 
                    value={form.referral.contact} 
                    onChange={(e)=>setForm(f=>({...f, referral:{...f.referral, contact:e.target.value}}))} 
                    fullWidth 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Vitals */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VitalsIcon color="primary" />
                <Typography variant="h6">Initial Vitals</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    label="Temperature (°C)" 
                    value={form.vitalsAtCheckIn.temperatureC} 
                    onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, temperatureC:e.target.value}}))} 
                    fullWidth 
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    label="Blood Pressure" 
                    value={form.vitalsAtCheckIn.bloodPressure} 
                    onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, bloodPressure:e.target.value}}))} 
                    fullWidth 
                    placeholder="120/80"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    label="Respiratory Rate" 
                    value={form.vitalsAtCheckIn.respiratoryRate} 
                    onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, respiratoryRate:e.target.value}}))} 
                    fullWidth 
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    label="Pulse (BPM)" 
                    value={form.vitalsAtCheckIn.pulse} 
                    onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, pulse:e.target.value}}))} 
                    fullWidth 
                    type="number"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Medical History */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicalIcon color="primary" />
                <Typography variant="h6">Medical History</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Allergies */}
                <AllergyInput
                  allergies={form.allergies}
                  onChange={(allergies) => setForm(f => ({ ...f, allergies }))}
                  apiClient={api}
                />

                {/* Medications */}
                <MedicationInput
                  medications={form.medications}
                  onChange={(medications) => setForm(f => ({ ...f, medications }))}
                  apiClient={api}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Error and Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              type="submit" 
              size="large"
              startIcon={<PersonAddIcon />}
              sx={{ 
                py: 2, 
                px: 4, 
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
              }}
            >
              Register Patient
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All patient data is encrypted and HIPAA compliant
            </Typography>
          </Paper>
        </Box>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onClose={handleSuccessClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
              <CheckIcon />
            </Avatar>
            <Typography variant="h5">Patient Registered Successfully!</Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>{form.fullName}</strong> has been successfully registered in the EMR system.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient information has been securely stored and is ready for medical care.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button variant="contained" onClick={handleSuccessClose} size="large">
              Register Another Patient
            </Button>
            <Button variant="outlined" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
    </Navigation>
  );
}
