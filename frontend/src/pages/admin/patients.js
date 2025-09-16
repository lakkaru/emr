import * as React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';

export default function AdminPatientsPage() {
  const { token, user } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(null);

  React.useEffect(() => {
    if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return; }
    if (user && user.role !== 'admin') { if (typeof window !== 'undefined') window.location.href = '/login'; return; }
    api.get('/patients').then(r => setItems(r.items)).catch(e => setError(e.message));
  }, [token, user]);

  const openEdit = async (id) => {
    try {
      const p = await api.get(`/patients/${id}`);
      setForm({ ...p, dob: p.dob ? p.dob.slice(0,10) : '' });
      setOpen(true);
    } catch (e) { setError(e.message); }
  };

  const save = async () => {
    try {
      const id = form._id;
      const payload = { ...form };
      delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt;
  await api.post(`/patients/check-duplicate`, { fullName: payload.fullName, dob: payload.dob, phone: payload.phone });
  // proceed regardless; admin override
  await api.put(`/patients/${id}`, payload);
      setOpen(false);
      // refresh list
      const r = await api.get('/patients');
      setItems(r.items);
    } catch (e) { setError(e.message); }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h6" gutterBottom>Patients (Admin)</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <List>
        {items.map(p => (
          <ListItem key={p._id} secondaryAction={<IconButton edge="end" aria-label="edit" onClick={()=>openEdit(p._id)}><EditIcon/></IconButton>}>
            <ListItemText primary={p.fullName} secondary={`${new Date(p.dob).toLocaleDateString()} • ${p.phone}`} />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth>
        <DialogTitle>Edit patient</DialogTitle>
        <DialogContent>
          {form && (
            <Box sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
              <TextField label="Full name" value={form.fullName||''} onChange={(e)=>setForm(f=>({...f, fullName:e.target.value}))} fullWidth />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker label="Date of Birth" value={form.dob||null} onChange={(val)=>setForm(f=>({...f, dob: val ? val.format('YYYY-MM-DD'): ''}))} slotProps={{ textField: { fullWidth: true }}} />
                </Grid>
                <Grid item xs={6}><TextField label="Phone" value={form.phone||''} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} fullWidth /></Grid>
              </Grid>
              <TextField label="Address" value={form.address||''} onChange={(e)=>setForm(f=>({...f, address:e.target.value}))} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
