import * as React from 'react';
import { Container, TextField, Button, Typography, Box, Grid, Alert, Chip, Stack, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';

export default function RegisterPage() {
  const { token } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  const initialForm = {
    fullName: '', nickname: '', dob: '', gender: '', address: '', phone: '', email: '',
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
    if (!form.fullName || !form.dob || !form.phone) return;
    try {
      const res = await api.post('/patients/check-duplicate', { fullName: form.fullName, dob: form.dob, phone: form.phone });
      setDuplicate(res.duplicate ? res.patient : null);
    } catch { /* ignore */ }
  };

  React.useEffect(() => { checkDuplicate(); }, [form.fullName, form.dob, form.phone]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      // Normalize numeric vitals
      const vs = payload.vitalsAtCheckIn;
      ['temperatureC','respiratoryRate','pulse'].forEach(k => { if (vs[k] === '') vs[k] = null; else vs[k] = Number(vs[k]); });
      if (!token) throw new Error('Please login');
      const created = await api.post('/patients', payload);
      setSuccess('Patient created');
      setForm(initialForm);
      setDuplicate(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h6" gutterBottom>New Patient Registration</Typography>
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Full name" value={form.fullName} onChange={onChange('fullName')} required fullWidth />
        <TextField label="Nickname (optional)" value={form.nickname} onChange={onChange('nickname')} fullWidth />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              label="Date of Birth"
              value={form.dob || null}
              onChange={(val)=> setForm(f=>({...f, dob: val ? val.format('YYYY-MM-DD') : ''}))}
              slotProps={{ textField: { fullWidth: true, required: true }}}
            />
          </Grid>
          <Grid item xs={6}><TextField label="Gender" value={form.gender} onChange={onChange('gender')} fullWidth /></Grid>
        </Grid>
        <TextField label="Address" value={form.address} onChange={onChange('address')} fullWidth />
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Phone" value={form.phone} onChange={onChange('phone')} required fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Email" type="email" value={form.email} onChange={onChange('email')} fullWidth /></Grid>
        </Grid>

        <Typography variant="subtitle1">Insurance</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField label="Provider" value={form.insurance.provider} onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, provider:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Member ID" value={form.insurance.memberId} onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, memberId:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Group #" value={form.insurance.groupNumber} onChange={(e)=>setForm(f=>({...f, insurance:{...f.insurance, groupNumber:e.target.value}}))} fullWidth /></Grid>
        </Grid>

        <Typography variant="subtitle1">Referral</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Source" value={form.referral.source} onChange={(e)=>setForm(f=>({...f, referral:{...f.referral, source:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Contact" value={form.referral.contact} onChange={(e)=>setForm(f=>({...f, referral:{...f.referral, contact:e.target.value}}))} fullWidth /></Grid>
        </Grid>

        <Typography variant="subtitle1">Vitals at Check-in</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Temp (C)" value={form.vitalsAtCheckIn.temperatureC} onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, temperatureC:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="BP" value={form.vitalsAtCheckIn.bloodPressure} onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, bloodPressure:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Respiratory Rate" value={form.vitalsAtCheckIn.respiratoryRate} onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, respiratoryRate:e.target.value}}))} fullWidth /></Grid>
          <Grid item xs={6}><TextField label="Pulse" value={form.vitalsAtCheckIn.pulse} onChange={(e)=>setForm(f=>({...f, vitalsAtCheckIn:{...f.vitalsAtCheckIn, pulse:e.target.value}}))} fullWidth /></Grid>
        </Grid>

        {duplicate && (
          <Alert severity="warning">Possible duplicate: {duplicate.fullName} ({new Date(duplicate.dob).toLocaleDateString()})</Alert>
        )}

        <Typography variant="subtitle1">Allergies</Typography>
        <Stack spacing={1}>
          {form.allergies.map((a, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx}>
              <Grid item xs={5}><TextField label="Substance" value={a.substance} onChange={(e)=>setForm(f=>{ const arr=[...f.allergies]; arr[idx]={...arr[idx], substance:e.target.value}; return {...f, allergies:arr}; })} fullWidth /></Grid>
              <Grid item xs={4}><TextField label="Reaction" value={a.reaction||''} onChange={(e)=>setForm(f=>{ const arr=[...f.allergies]; arr[idx]={...arr[idx], reaction:e.target.value}; return {...f, allergies:arr}; })} fullWidth /></Grid>
              <Grid item xs={2}><TextField label="Severity" value={a.severity||''} onChange={(e)=>setForm(f=>{ const arr=[...f.allergies]; arr[idx]={...arr[idx], severity:e.target.value}; return {...f, allergies:arr}; })} fullWidth /></Grid>
              <Grid item xs={1}><IconButton aria-label="remove allergy" onClick={()=>setForm(f=>({...f, allergies: f.allergies.filter((_,i)=>i!==idx)}))}><DeleteIcon /></IconButton></Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon/>} onClick={()=>setForm(f=>({...f, allergies:[...f.allergies, { substance:'' }]}))}>Add allergy</Button>
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Medications</Typography>
        <Stack spacing={1}>
          {form.medications.map((m, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx}>
              <Grid item xs={5}><TextField label="Name" value={m.name} onChange={(e)=>setForm(f=>{ const arr=[...f.medications]; arr[idx]={...arr[idx], name:e.target.value}; return {...f, medications:arr}; })} fullWidth /></Grid>
              <Grid item xs={3}><TextField label="Dosage" value={m.dosage||''} onChange={(e)=>setForm(f=>{ const arr=[...f.medications]; arr[idx]={...arr[idx], dosage:e.target.value}; return {...f, medications:arr}; })} fullWidth /></Grid>
              <Grid item xs={3}><TextField label="Frequency" value={m.frequency||''} onChange={(e)=>setForm(f=>{ const arr=[...f.medications]; arr[idx]={...arr[idx], frequency:e.target.value}; return {...f, medications:arr}; })} fullWidth /></Grid>
              <Grid item xs={1}><IconButton aria-label="remove medication" onClick={()=>setForm(f=>({...f, medications: f.medications.filter((_,i)=>i!==idx)}))}><DeleteIcon /></IconButton></Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon/>} onClick={()=>setForm(f=>({...f, medications:[...f.medications, { name:'' }]}))}>Add medication</Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button variant="contained" type="submit">Save patient</Button>
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Chip label="Allergies" color="warning" variant="outlined" />
        <Chip label="Medications" variant="outlined" />
      </Stack>
    </Container>
  );
}
