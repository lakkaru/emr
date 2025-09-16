import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  IconButton,
  Grid,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchMedications, getMedicationDosages, getMedicationFrequencies } from '../utils/referenceData';

export function MedicationInput({ medications = [], onChange, apiClient }) {
  const [availableMedications, setAvailableMedications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMedications = async () => {
      setLoading(true);
      try {
        const data = await fetchMedications(apiClient);
        setAvailableMedications(data);
      } catch (error) {
        console.error('Failed to load medications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (apiClient) {
      loadMedications();
    }
  }, [apiClient]);

  const addMedication = () => {
    onChange([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const removeMedication = (index) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getDosagesForMedication = (medicationName) => {
    const medication = availableMedications.find(m => 
      m.name === medicationName || m.brandNames?.includes(medicationName)
    );
    return getMedicationDosages(medication);
  };

  const getFrequenciesForMedication = (medicationName) => {
    const medication = availableMedications.find(m => 
      m.name === medicationName || m.brandNames?.includes(medicationName)
    );
    return getMedicationFrequencies(medication);
  };

  const getMedicationOptions = () => {
    const options = [];
    availableMedications.forEach(med => {
      options.push(med.name);
      if (med.brandNames) {
        options.push(...med.brandNames);
      }
    });
    return [...new Set(options)].sort();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Current Medications</Typography>
        <IconButton onClick={addMedication} color="primary" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      {medications.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No medications recorded. Click the + button to add medications.
        </Alert>
      )}

      {medications.map((medication, index) => {
        const medicationData = availableMedications.find(m => 
          m.name === medication.name || m.brandNames?.includes(medication.name)
        );

        return (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={getMedicationOptions()}
                  value={medication.name || ''}
                  onChange={(event, newValue) => updateMedication(index, 'name', newValue || '')}
                  loading={loading}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medication Name"
                      variant="outlined"
                      fullWidth
                      required
                    />
                  )}
                />
                {medicationData && (
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={medicationData.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    {medicationData.genericName && medicationData.genericName !== medication.name && (
                      <Chip 
                        label={`Generic: ${medicationData.genericName}`} 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} sm={3}>
                <Autocomplete
                  options={getDosagesForMedication(medication.name)}
                  value={medication.dosage || ''}
                  onChange={(event, newValue) => updateMedication(index, 'dosage', newValue || '')}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Dosage"
                      variant="outlined"
                      fullWidth
                      placeholder="e.g., 250mg"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Autocomplete
                  options={getFrequenciesForMedication(medication.name)}
                  value={medication.frequency || ''}
                  onChange={(event, newValue) => updateMedication(index, 'frequency', newValue || '')}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Frequency"
                      variant="outlined"
                      fullWidth
                      placeholder="e.g., Once daily"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <IconButton 
                  onClick={() => removeMedication(index)} 
                  color="error"
                  sx={{ width: '100%' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}

export default MedicationInput;
