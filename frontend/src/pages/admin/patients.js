import * as React from 'react';
import { 
  Container, Typography, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, TextField, Grid, Alert, Card, CardContent, CardHeader,
  Avatar, Chip, Paper, Divider, Stack, InputAdornment, Fab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Tooltip, Badge, Accordion, 
  AccordionSummary, AccordionDetails, MenuItem
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as PersonIcon, 
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as AddressIcon,
  Cake as BirthdayIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  LocalHospital as HospitalIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Security as InsuranceIcon,
  Healing as MedicalIcon,
  MonitorHeart as VitalsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import Navigation from '../../components/Navigation';
import AllergyInput from '../../components/AllergyInput';
import MedicationInput from '../../components/MedicationInput';

export default function AdminPatientsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  const [items, setItems] = React.useState([]);
  const [filteredItems, setFilteredItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Wait for auth context to initialize
    if (authLoading) return;
    
    if (!token) { 
      console.log('No token found, redirecting to login');
      if (typeof window !== 'undefined') window.location.href = '/login'; 
      return; 
    }
    
    if (!user || user.role !== 'admin') { 
      console.log('User is not admin, redirecting to login');
      if (typeof window !== 'undefined') window.location.href = '/login'; 
      return; 
    }
    
    loadPatients();
  }, [token, user, authLoading]);

  React.useEffect(() => {
    try {
      const filtered = items.filter(patient => {
        if (!patient) return false;
        
        const name = (patient.fullName || '').toLowerCase();
        const phones = (patient.phones || []).map(p => p.number).join(' ').toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const address = (patient.address || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return name.includes(search) || 
               phones.includes(search) || 
               email.includes(search) ||
               address.includes(search);
      });
      setFilteredItems(filtered);
      setPage(0);
    } catch (e) {
      console.error('Error filtering patients:', e);
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const r = await api.get('/patients');
      setItems(r.items || []);
    } catch (e) {
      console.error('Error loading patients:', e);
      setError(`Failed to load patients: ${e.message}`);
      
      // If it's an authentication error, redirect to login
      if (e.message.includes('Unauthorized') || e.message.includes('Invalid token')) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = async (id) => {
    setLoading(true);
    try {
      const p = await api.get(`/patients/${id}`);
      console.log('Patient data:', p); // Debug log
      
      // Ensure all required fields exist
      const formData = {
        ...p,
        dob: p.dob ? dayjs(p.dob) : null,
        fullName: p.fullName || '',
        nickname: p.nickname || '',
        gender: p.gender || '',
        phones: p.phones && p.phones.length > 0 ? p.phones : [{ type: 'mobile', number: '' }],
        email: p.email || '',
        address: p.address || '',
        // Insurance information
        insurance: {
          provider: p.insurance?.provider || '',
          memberId: p.insurance?.memberId || '',
          groupNumber: p.insurance?.groupNumber || ''
        },
        // Medical information
        allergies: p.allergies || [],
        medications: p.medications || [],
        pastMedicalHistory: p.pastMedicalHistory || '',
        problemList: p.problemList || [],
        immunizations: p.immunizations || [],
        // Vitals
        vitalsAtCheckIn: {
          temperatureC: p.vitalsAtCheckIn?.temperatureC || '',
          bloodPressure: p.vitalsAtCheckIn?.bloodPressure || '',
          respiratoryRate: p.vitalsAtCheckIn?.respiratoryRate || '',
          pulse: p.vitalsAtCheckIn?.pulse || ''
        },
        // Referral
        referral: {
          source: p.referral?.source || '',
          contact: p.referral?.contact || ''
        }
      };
      
      setForm(formData);
      setOpen(true);
      setError('');
    } catch (e) { 
      console.error('Error loading patient:', e);
      setError(`Failed to load patient: ${e.message}`); 
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const id = form._id;
      if (!id) {
        throw new Error('Patient ID is missing');
      }

      // Create clean payload
      const payload = {
        fullName: form.fullName || '',
        nickname: form.nickname || '',
        dob: form.dob ? (dayjs.isDayjs(form.dob) ? form.dob.format('YYYY-MM-DD') : form.dob) : '',
        gender: form.gender || '',
        phones: form.phones || [{ type: 'mobile', number: '' }],
        email: form.email || '',
        address: form.address || '',
        insurance: form.insurance || {},
        allergies: form.allergies || [],
        medications: form.medications || [],
        pastMedicalHistory: form.pastMedicalHistory || '',
        problemList: form.problemList || [],
        immunizations: form.immunizations || [],
        vitalsAtCheckIn: form.vitalsAtCheckIn || {},
        referral: form.referral || {}
      };

      console.log('Saving patient:', { id, payload }); // Debug log
      
      const updatedPatient = await api.put(`/patients/${id}`, payload);
      console.log('Updated patient:', updatedPatient); // Debug log
      
      setOpen(false);
      setForm(null);
      setSuccess('Patient updated successfully!');
      await loadPatients();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { 
      console.error('Error saving patient:', e);
      setError(`Failed to save patient: ${e.message}`); 
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Not provided';
      if (dayjs.isDayjs(dateString)) {
        return dateString.format('MMM DD, YYYY');
      }
      return dayjs(dateString).format('MMM DD, YYYY');
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  const calculateAge = (dob) => {
    try {
      if (!dob) return 'N/A';
      const birthDate = dayjs(dob);
      const today = dayjs();
      
      if (!birthDate.isValid()) return 'N/A';
      
      return today.diff(birthDate, 'year');
    } catch (e) {
      console.error('Age calculation error:', e);
      return 'N/A';
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
            <HospitalIcon />
          </Avatar>
          <Typography variant="h6">Loading EMR System...</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Navigation title="Patient Management" currentPath="/admin/patients">
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3
      }}>
        <Container maxWidth="xl">
        {/* Header Card */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PeopleIcon sx={{ fontSize: 28 }} />
              </Avatar>
            }
            title={
              <Typography variant="h4" color="primary">
                Patient Management
              </Typography>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Chip 
                  icon={<AdminIcon />} 
                  label="Administrator Access" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<HospitalIcon />} 
                  label="HIPAA Compliant" 
                  color="success" 
                  variant="outlined" 
                />
                <Badge badgeContent={items.length} color="secondary">
                  <Chip label="Total Patients" variant="outlined" />
                </Badge>
              </Box>
            }
            action={
              <Tooltip title="Add New Patient">
                <Fab 
                  color="primary" 
                  onClick={() => window.location.href = '/register'}
                  sx={{ mr: 2 }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            }
          />
        </Card>

        {/* Alerts */}
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

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search patients by name, phone, email, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Chip 
                    label={`${filteredItems.length} Patient${filteredItems.length !== 1 ? 's' : ''}`} 
                    color="primary" 
                  />
                  {searchTerm && (
                    <Chip 
                      label="Filtered" 
                      color="secondary" 
                      onDelete={() => setSearchTerm('')} 
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader 
            title="Registered Patients" 
            sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Age</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                  <TableCell><strong>Registered</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient) => (
                    <TableRow key={patient._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {patient.fullName}
                            </Typography>
                            {patient.nickname && (
                              <Typography variant="caption" color="text.secondary">
                                "{patient.nickname}"
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BirthdayIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2">
                              {calculateAge(patient.dob)} years
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(patient.dob)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Phone Numbers:</Typography>
                                {(patient.phones || []).map((phone, idx) => (
                                  <Typography key={idx} variant="body2">
                                    {phone.number} ({phone.type})
                                  </Typography>
                                ))}
                              </Box>
                            }
                            arrow
                            placement="top"
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                              <PhoneIcon fontSize="small" color="primary" />
                              <Box>
                                {(patient.phones || []).slice(0, 1).map((phone, idx) => (
                                  <Typography key={idx} variant="body2">
                                    {phone.number} ({phone.type})
                                    {(patient.phones || []).length > 1 && (
                                      <Typography component="span" variant="caption" color="text.secondary">
                                        {' '}+{(patient.phones || []).length - 1} more
                                      </Typography>
                                    )}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          </Tooltip>
                          {patient.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="primary" />
                              <Typography variant="body2">{patient.email}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AddressIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {patient.address || 'Not provided'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(patient.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Patient">
                          <IconButton 
                            color="primary" 
                            onClick={() => openEdit(patient._id)}
                            sx={{ 
                              bgcolor: 'primary.light', 
                              '&:hover': { bgcolor: 'primary.main', color: 'white' } 
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Edit Patient Dialog */}
        <Dialog 
          open={open} 
          onClose={() => {
            setOpen(false);
            setForm(null);
            setError('');
          }} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <EditIcon />
              </Avatar>
              <Typography variant="h6">Edit Patient Information</Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {form && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                  <Typography variant="subtitle2" color="info.dark" gutterBottom>
                    Patient ID: {form._id}
                  </Typography>
                  <Typography variant="caption" color="info.dark">
                    Last updated: {formatDate(form.updatedAt)}
                  </Typography>
                </Paper>

                {/* Basic Information */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      Patient Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <TextField 
                          label="Full Name" 
                          value={form.fullName || ''} 
                          onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} 
                          fullWidth 
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField 
                          label="Nickname (Optional)" 
                          value={form.nickname || ''} 
                          onChange={(e) => setForm(f => ({ ...f, nickname: e.target.value }))} 
                          fullWidth 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker 
                          label="Date of Birth" 
                          value={form.dob || null} 
                          onChange={(val) => setForm(f => ({ ...f, dob: val }))} 
                          slotProps={{ 
                            textField: { 
                              fullWidth: true, 
                              required: true,
                              helperText: form.dob ? `Age: ${calculateAge(form.dob)} years` : ''
                            }
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          select
                          label="Gender" 
                          value={form.gender || ''} 
                          onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))} 
                          fullWidth
                          placeholder="Select Gender"
                        >
                          <MenuItem value="">Select Gender</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                          <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Phone Numbers *
                          </Typography>
                          {(form.phones || []).map((phone, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                              <TextField
                                select
                                label="Type"
                                value={phone.type}
                                onChange={(e) => {
                                  const newPhones = [...(form.phones || [])];
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
                                  const newPhones = [...(form.phones || [])];
                                  newPhones[index].number = e.target.value;
                                  setForm(f => ({ ...f, phones: newPhones }));
                                }}
                                required={index === 0}
                                fullWidth
                              />
                              {(form.phones || []).length > 1 && (
                                <IconButton
                                  onClick={() => {
                                    const newPhones = (form.phones || []).filter((_, i) => i !== index);
                                    setForm(f => ({ ...f, phones: newPhones }));
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                              {index === (form.phones || []).length - 1 && (
                                <IconButton
                                  onClick={() => {
                                    setForm(f => ({ ...f, phones: [...(f.phones || []), { type: 'mobile', number: '' }] }));
                                  }}
                                  color="primary"
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Email Address" 
                          type="email"
                          value={form.email || ''} 
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} 
                          fullWidth 
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          label="Address" 
                          value={form.address || ''} 
                          onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} 
                          fullWidth 
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Insurance Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsuranceIcon color="primary" />
                      Insurance Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField 
                          label="Insurance Provider" 
                          value={form.insurance?.provider || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            insurance: { ...f.insurance, provider: e.target.value } 
                          }))} 
                          fullWidth 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Member ID" 
                          value={form.insurance?.memberId || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            insurance: { ...f.insurance, memberId: e.target.value } 
                          }))} 
                          fullWidth 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Group Number" 
                          value={form.insurance?.groupNumber || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            insurance: { ...f.insurance, groupNumber: e.target.value } 
                          }))} 
                          fullWidth 
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Medical History */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MedicalIcon color="primary" />
                      Medical History
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      {/* Allergies */}
                      <AllergyInput
                        allergies={form.allergies || []}
                        onChange={(allergies) => setForm(f => ({ ...f, allergies }))}
                        apiClient={api}
                      />

                      {/* Medications */}
                      <MedicationInput
                        medications={form.medications || []}
                        onChange={(medications) => setForm(f => ({ ...f, medications }))}
                        apiClient={api}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Vitals */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VitalsIcon color="primary" />
                      Current Vitals
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField 
                          label="Temperature (°C)" 
                          value={form.vitalsAtCheckIn?.temperatureC || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            vitalsAtCheckIn: { ...f.vitalsAtCheckIn, temperatureC: e.target.value } 
                          }))} 
                          fullWidth 
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField 
                          label="Blood Pressure" 
                          value={form.vitalsAtCheckIn?.bloodPressure || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            vitalsAtCheckIn: { ...f.vitalsAtCheckIn, bloodPressure: e.target.value } 
                          }))} 
                          fullWidth 
                          placeholder="120/80"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField 
                          label="Respiratory Rate" 
                          value={form.vitalsAtCheckIn?.respiratoryRate || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            vitalsAtCheckIn: { ...f.vitalsAtCheckIn, respiratoryRate: e.target.value } 
                          }))} 
                          fullWidth 
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField 
                          label="Pulse (BPM)" 
                          value={form.vitalsAtCheckIn?.pulse || ''} 
                          onChange={(e) => setForm(f => ({ 
                            ...f, 
                            vitalsAtCheckIn: { ...f.vitalsAtCheckIn, pulse: e.target.value } 
                          }))} 
                          fullWidth 
                          type="number"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Button 
              onClick={() => {
                setOpen(false);
                setForm(null);
                setError('');
              }} 
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={save}
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
    </Navigation>
  );
}
