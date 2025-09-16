import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  IconButton,
  Grid,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchAllergies, getAllergyReactions } from '../utils/referenceData';

export function AllergyInput({ allergies = [], onChange, apiClient }) {
  const [availableAllergies, setAvailableAllergies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAllergies = async () => {
      setLoading(true);
      try {
        const data = await fetchAllergies(apiClient);
        setAvailableAllergies(data);
      } catch (error) {
        console.error('Failed to load allergies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (apiClient) {
      loadAllergies();
    }
  }, [apiClient]);

  const addAllergy = () => {
    onChange([...allergies, { substance: '', reaction: '', severity: 'mild' }]);
  };

  const removeAllergy = (index) => {
    onChange(allergies.filter((_, i) => i !== index));
  };

  const updateAllergy = (index, field, value) => {
    const updated = [...allergies];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getReactionsForAllergy = (allergyName) => {
    const allergy = availableAllergies.find(a => a.name === allergyName);
    return getAllergyReactions(allergy);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Allergies</Typography>
        <IconButton onClick={addAllergy} color="primary" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      {allergies.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No allergies recorded. Click the + button to add allergies.
        </Alert>
      )}

      {allergies.map((allergy, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={availableAllergies.map(a => a.name)}
                value={allergy.substance || ''}
                onChange={(event, newValue) => updateAllergy(index, 'substance', newValue || '')}
                loading={loading}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Allergy/Substance"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={getReactionsForAllergy(allergy.substance).map(r => r.name)}
                value={allergy.reaction || ''}
                onChange={(event, newValue) => updateAllergy(index, 'reaction', newValue || '')}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Reaction"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Severity"
                value={allergy.severity || 'mild'}
                onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={2}>
              <IconButton 
                onClick={() => removeAllergy(index)} 
                color="error"
                sx={{ width: '100%' }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>

          {allergy.severity === 'severe' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <strong>Severe Allergy:</strong> This requires immediate medical attention and special precautions.
            </Alert>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default AllergyInput;
